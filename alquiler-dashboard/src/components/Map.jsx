import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { scaleSequential } from 'd3-scale';
import provinceNames from '../utils/provinceNames.js';

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 550;

export default function Map({ filtered, euroDomain }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [features, setFeatures] = useState(null);
  const valuesRef = useRef(new Map());

  useEffect(() => {
    const div = d3
      .select('#root')
      .append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('background', 'rgba(0,0,0,.8)')
      .style('color', '#fff')
      .style('border', 'none')
      .style('padding', '4px 8px')
      .style('border-radius', '4px');
    tooltipRef.current = div;
    return () => div.remove();
  }, []);

  // load topojson once
  useEffect(() => {
    async function load() {
      const topo = await d3.json('/src/data/provincias_es.topojson');
      const feats = topojson.feature(topo, topo.objects.provinces).features;
      setFeatures(feats);
    }
    load();
  }, []);


  const showTooltip = (id, event) => {
    if (!tooltipRef.current) return;
    const name = provinceNames[id] || `Provincia ${id}`;
    const v = valuesRef.current.get(id);
    const text =
      v != null
        ? `${name} – ${v.toFixed(2).replace('.', ',')} €/m²`
        : `${name} – Sin dato`;
    tooltipRef.current
      .text(text)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY + 10}px`)
      .transition()
      .duration(150)
      .style('opacity', 1);
  };

  const hideTooltip = () => {
    if (!tooltipRef.current) return;
    tooltipRef.current
      .transition()
      .duration(150)
      .style('opacity', 0);
  };

  const draw = useCallback(() => {
    if (!features) return;
    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const width = container?.clientWidth || DEFAULT_WIDTH;
    const height = container?.clientHeight || DEFAULT_HEIGHT;
    svg.attr('width', width).attr('height', height);
    const projection = d3.geoMercator();
    const path = d3.geoPath(projection);
    projection.fitSize([width, height], { type: 'FeatureCollection', features });

    const values = d3.rollup(
      filtered.filter(d => d.euros != null && !Number.isNaN(d.euros)),
      v => d3.mean(v, d => d.euros),
      d => d.cod_provincia
    );
    valuesRef.current = values;

    const color = scaleSequential()
      .domain(euroDomain)
      .interpolator(t => d3.interpolateLab('#e0e0e0', '#082567')(t));

    const paths = svg
      .selectAll('path')
      .data(features, d => d.id)
      .join('path')
      .attr('d', path)
      .attr('stroke', '#666')
      .on('mouseenter', (event, f) => {
        showTooltip(f.id, event);
      })
      .on('mouseleave', hideTooltip)
      .each(function (d) {
        d3.select(this)
          .selectAll('title')
          .data([provinceNames[d.id] || `Provincia ${d.id}`])
          .join('title')
          .text(t => t);
      });

    paths
      .transition()
      .duration(600)
      .attr('fill', d => {
        const val = values.get(d.id);
        return val != null ? color(val) : '#ccc';
      });
  }, [features, filtered, euroDomain]);

  useEffect(draw, [draw]);

  useEffect(() => {
    const obs = new ResizeObserver(draw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: DEFAULT_HEIGHT }}>
      <svg ref={svgRef} width={DEFAULT_WIDTH} height={DEFAULT_HEIGHT} role="img">
        {filtered.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle" fill="#777">
            Sin datos para los filtros actuales
          </text>
        )}
      </svg>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import provinceNames from '../utils/provinceNames.js';
import provToCca from '../utils/provToCca.js';
import createColorScale from '../utils/colorScale.js';

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 550;

export default function Map({ filtered, colorScaleDomain, onSelect, selectedCca }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [features, setFeatures] = useState(null);

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

  const colorScale = useMemo(
    () => (colorScaleDomain ? createColorScale(colorScaleDomain) : null),
    [colorScaleDomain]
  );

  const showTooltip = (id, info, event) => {
    if (!tooltipRef.current) return;
    const name = provinceNames[id] || `Provincia ${id}`;
    const euros = info;
    tooltipRef.current
      .html(
        `<strong>${name}</strong><br/>Alquiler medio: ${
          euros != null && !Number.isNaN(euros)
            ? euros.toFixed(2).replace('.', ',')
            : 'Sin dato'
        } €/m²`
      )
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
      filtered.filter(d => d.euros_m2 != null && !Number.isNaN(d.euros_m2)),
      v => d3.mean(v, d => d.euros_m2),
      d => d.cod_provincia
    );

    const color = colorScale;

    const paths = svg
      .selectAll('path')
      .data(features, d => d.id)
      .join('path')
      .attr('d', path)
      .attr('stroke', '#666')
      .style('opacity', d =>
        selectedCca && provToCca[d.id] !== selectedCca ? 0.2 : 1
      )
      .on('click', (event, d) => {
        if (onSelect) onSelect(d.id);
      })
      .on('mouseenter', (event, f) => {
        const info = values.get(f.id);
        showTooltip(f.id, info, event);
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
        const v = values.get(d.id);
        return v != null ? color(v) : '#ccc';
      });
  }, [features, filtered, colorScale, onSelect, selectedCca]);

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

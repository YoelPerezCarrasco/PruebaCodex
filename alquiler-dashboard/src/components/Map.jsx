import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { scaleQuantize } from 'd3-scale';
import { schemeYlOrRd } from 'd3-scale-chromatic';
import provinceNames from '../utils/provinceNames.js';

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 550;

export default function Map({ data, year, colorScaleDomain, onSelect }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const div = d3.select('#root')
      .append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
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
    () => scaleQuantize().domain(colorScaleDomain).range(schemeYlOrRd[7]),
    [colorScaleDomain]
  );

  const showTooltip = (id, val, event) => {
    if (!tooltipRef.current) return;
    const name = provinceNames[id] || `Provincia ${id}`;
    tooltipRef.current
      .html(
        `<strong>${name}</strong><br/>${
          val != null && !Number.isNaN(val) ? val.toFixed(1) + ' €' : 'Sin dato'
        }`
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
      data.filter(
        d => d.anio === year && d.Total != null && !Number.isNaN(+d.Total)
      ),
      v => d3.mean(v, d => +d.Total),
      d => {
        const m = /^\d{2}/.exec(d.Municipio || '');
        return m ? m[0].padStart(2, '0') : null;
      }
    );

    const color = colorScale;

    const paths = svg
      .selectAll('path')
      .data(features, d => d.id)
      .join('path')
      .attr('d', path)
      .attr('stroke', '#666')
      .on('click', (event, d) => {
        if (onSelect) onSelect(d.id);
      })
      .on('mouseenter', (event, f) => {
        const val = values.get(f.id);
        showTooltip(f.id, val, event);
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
  }, [features, data, year, colorScale, onSelect]);

  useEffect(draw, [draw]);

  useEffect(() => {
    const obs = new ResizeObserver(draw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }}>
      <svg ref={svgRef} width={DEFAULT_WIDTH} height={DEFAULT_HEIGHT} role="img" />
    </div>
  );
}

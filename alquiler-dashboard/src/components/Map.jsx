import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 550;

export default function Map({ data, onSelect }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [features, setFeatures] = useState(null);

  // load topojson once
  useEffect(() => {
    async function load() {
      const topo = await d3.json('/src/data/provincias_es.topojson');
      const feats = topojson.feature(topo, topo.objects.provinces).features;
      setFeatures(feats);
    }
    load();
  }, []);

  const draw = () => {
    if (!features) return;
    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const width = container?.clientWidth || DEFAULT_WIDTH;
    const height = container?.clientHeight || DEFAULT_HEIGHT;
    svg.attr('width', width).attr('height', height);
    const projection = d3.geoMercator();
    const path = d3.geoPath(projection);
    projection.fitSize([width, height], { type: 'FeatureCollection', features });

    svg
      .selectAll('path')
      .data(features)
      .join('path')
      .attr('d', path)
      .attr('stroke', '#999')
      .attr('fill', '#eee')
      .on('click', (event, d) => {
        if (onSelect) onSelect(d.id);
      });
  };

  useEffect(draw, [features]);

  useEffect(() => {
    const obs = new ResizeObserver(draw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [features]);

  return (
    <div ref={containerRef} style={{ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }}>
      <svg ref={svgRef} width={DEFAULT_WIDTH} height={DEFAULT_HEIGHT} />
    </div>
  );
}

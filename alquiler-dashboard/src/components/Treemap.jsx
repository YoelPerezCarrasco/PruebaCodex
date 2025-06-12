import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { hierarchy, treemap } from 'd3-hierarchy';
import ccaNames from '../utils/ccaNames.js';
import provToCca from '../utils/provToCca.js';
import colorScale from '../utils/colorScale.js';

function Treemap({ filtered, onSelect, selectedCca, colorDomain }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!filtered) return;
    const scale = colorScale(colorDomain);
    const data = d3
      .rollups(
        filtered,
        v => ({
          alquiler: d3.mean(v, d => d.valor),
          euros: d3.mean(v, d => d.euros),
          poblacion: v.length,
        }),
        d => provToCca[d.cod_provincia]
      )
      .map(([cca, vals]) => ({ cca, ...vals }));
    const root = hierarchy({ children: data }).sum(d => d.poblacion);
    treemap().size([300, 300]).padding(1)(root);

    const svg = d3.select(ref.current);
    const sel = svg.selectAll('rect').data(root.leaves(), d => d.data.cca);

    sel
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => scale(d.data.alquiler))
      .attr('stroke', '#222')
      .style('opacity', d => (selectedCca && d.data.cca !== selectedCca ? 0.3 : 1))
      .on('click', (e, d) => onSelect && onSelect(d.data.cca))
      .selectAll('title')
      .data(d => [d])
      .join('title')
      .text(
        d =>
          `${ccaNames[d.data.cca]}: ${d.data.alquiler
            .toFixed(1)
            .replace('.', ',')} - ${d.data.euros
            ?.toFixed(0)
            .replace('.', ',')} €`
      );
  }, [filtered, selectedCca, colorDomain, onSelect]);

  return (
    <svg
      ref={ref}
      width="100%"
      height={300}
      role="img"
      aria-label="Treemap alquiler por CCAA"
    />
  );
}

export default Treemap;

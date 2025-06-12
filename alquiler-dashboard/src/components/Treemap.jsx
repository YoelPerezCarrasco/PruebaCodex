/* ───── Tarjeta Treemap: distribución superficie por CCAA ───── */
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
          euros_m2: d3.mean(v, d => d.euros_m2),
          poblacion: v.length,
        }),
        d => provToCca[d.cod_provincia]
      )
      .map(([cca, vals]) => ({ cca, ...vals }));
    const root = hierarchy({ children: data }).sum(d => d.poblacion);
    treemap().size([300, 300]).padding(1)(root);

    const svg = d3.select(ref.current);
    const sel = svg.selectAll('g.tile').data(root.leaves(), d => d.data.cca);

    const g = sel
      .join('g')
      .classed('tile', true)
      .style('cursor', 'pointer')
      .on('click', (e, d) => {
        if (!onSelect) return;
        if (selectedCca === d.data.cca) onSelect(null);
        else onSelect(d.data.cca);
        e.stopPropagation();
      });

    g
      .selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => scale(d.data.euros_m2))
      .attr('stroke', '#222')
      .style('opacity', d =>
        selectedCca && d.data.cca !== selectedCca ? 0.3 : 1
      );

    g
      .selectAll('text')
      .data(d => [d])
      .join('text')
      .text(d => d.data.cca)
      .attr('x', d => (d.x0 + d.x1) / 2)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('display', d => (d.x1 - d.x0) < 40 ? 'none' : null);

    g
      .selectAll('title')
      .data(d => [d])
      .join('title')
      .text(d => {
        const v = d.data.euros_m2;
        return `${ccaNames[d.data.cca]}: ${
          v != null ? v.toFixed(2).replace('.', ',') : 'Sin dato'
        } €/m²`;
      });
  }, [filtered, selectedCca, colorDomain, onSelect]);

  return (
    <svg
      ref={ref}
      width="100%"
      height={300}
      role="img"
      aria-label="Treemap alquiler por CCAA"
    >
      <rect
        width="100%"
        height="100%"
        fill="transparent"
        onClick={() => onSelect && onSelect(null)}
      />
      {filtered.length === 0 && (
        <text x="50%" y="50%" textAnchor="middle" fill="#777">
          Sin datos para los filtros actuales
        </text>
      )}
    </svg>
  );
}

export default Treemap;

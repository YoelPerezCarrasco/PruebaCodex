import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Scatter({ points, selectedCca }) {
  const ref = useRef();

  useEffect(() => {
    if (!points.length) {
      d3.select(ref.current).selectAll('*').remove();
      return;
    }
    const w = 320;
    const h = 200;
    const p = 30;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(points, d => d.indice))
      .nice()
      .range([p, w - p]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(points, d => d.euros))
      .nice()
      .range([h - p, p]);

    const svg = d3.select(ref.current).attr('width', w).attr('height', h);
    svg.selectAll('*').remove();

    svg
      .append('g')
      .attr('transform', `translate(0,${h - p})`)
      .call(d3.axisBottom(x));

    svg
      .append('g')
      .attr('transform', `translate(${p},0)`)
      .call(d3.axisLeft(y));

    const fill = selectedCca ? '#ff9800' : '#90caf9';

    svg
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', d => x(d.indice))
      .attr('cy', d => y(d.euros))
      .attr('r', 4)
      .attr('fill', fill)
      .append('title')
      .text(d => `${d.prov}: ${d.euros.toFixed(2)} €/m²`);
  }, [points, selectedCca]);

  return (
    <svg ref={ref} role="img" aria-label="Scatter €/m² vs índice">
      {points.length === 0 && (
        <text x="50%" y="50%" textAnchor="middle" fill="#777">
          Sin datos
        </text>
      )}
    </svg>
  );
}

export default Scatter;

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Scatter({ points, selectedCca }) {
  const ref = useRef();

  useEffect(() => {
    const w = 320;
    const h = 200;
    const p = 30;

    const svg = d3.select(ref.current).attr('width', w).attr('height', h);

    svg.selectAll('*').remove();

    if (!points.length) {
      svg
        .append('text')
        .attr('x', w / 2)
        .attr('y', h / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#777')
        .text('Sin datos');
      return () => svg.selectAll('*').remove();
    }

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

    return () => svg.selectAll('*').remove();
  }, [points, selectedCca]);

  return <svg ref={ref} role="img" aria-label="Scatter €/m² vs índice" />;
}

export default Scatter;

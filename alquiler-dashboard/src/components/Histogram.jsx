import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Histogram({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data.length) {
      d3.select(ref.current).selectAll('*').remove();
      return;
    }
    const width = 320;
    const height = 160;
    const svg = d3
      .select(ref.current)
      .attr('width', width)
      .attr('height', height);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data))
      .nice()
      .range([30, width - 10]);

    const bins = d3.bin().domain(x.domain()).thresholds(10)(data);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height - 20, 10]);

    svg.selectAll('*').remove();

    svg
      .append('g')
      .selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', d => x(d.x0) + 1)
      .attr('y', d => y(d.length))
      .attr('width', d => x(d.x1) - x(d.x0) - 1)
      .attr('height', d => y(0) - y(d.length))
      .attr('fill', '#4f83cc');

    svg
      .append('g')
      .attr('transform', `translate(0,${height - 20})`)
      .call(d3.axisBottom(x).ticks(5));
  }, [data]);

  return (
    <svg ref={ref} role="img" aria-label="Histograma €/m²">
      {data.length === 0 && (
        <text x="50%" y="50%" textAnchor="middle" fill="#777">
          Sin datos
        </text>
      )}
    </svg>
  );
}

export default Histogram;

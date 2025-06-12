import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Histogram({ data }) {
  const ref = useRef();

  useEffect(() => {
    const width = 320;
    const height = 160;
    const svg = d3
      .select(ref.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    if (data.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#777')
        .text('Sin datos');
      return () => svg.selectAll('*').remove();
    }

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

    return () => svg.selectAll('*').remove();
  }, [data]);

  return <svg ref={ref} role="img" aria-label="Histograma €/m²" />;
}

export default Histogram;

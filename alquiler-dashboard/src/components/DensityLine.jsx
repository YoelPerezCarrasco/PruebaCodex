import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function DensityLine({ data }) {
  const ref = useRef();

  useEffect(() => {
    const w = 320;
    const h = 160;
    const m = 30;
    const svg = d3.select(ref.current).attr('width', w).attr('height', h);
    svg.selectAll('*').remove();

    if (!data.length) {
      svg
        .append('text')
        .attr('x', w / 2)
        .attr('y', h / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#777')
        .text('Sin datos');
      return;
    }

    const x = d3.scaleLinear().domain(d3.extent(data)).nice().range([m, w - m]);

    const kde = kernelDensityEstimator(kernelEpanechnikov(0.2), x.ticks(40));
    const density = kde(data);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(density, d => d[1])])
      .nice()
      .range([h - m, m]);

    const line = d3
      .line()
      .curve(d3.curveBasis)
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    svg
      .append('path')
      .attr('d', line(density))
      .attr('fill', 'none')
      .attr('stroke', '#4f83cc')
      .attr('stroke-width', 2);

    svg
      .append('g')
      .attr('transform', `translate(0,${h - m})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

    svg
      .append('g')
      .attr('transform', `translate(${m},0)`)
      .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));

    function kernelEpanechnikov(k) {
      return v => (Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0);
    }
    function kernelDensityEstimator(kernel, X) {
      return V => X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
    }
  }, [data]);

  return <svg ref={ref} role="img" aria-label="Densidad €/m²" />;
}

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function LineChart({ data, selectedProv }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const div = d3
      .select('#root')
      .append('div')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('background', 'rgba(0,0,0,.8)')
      .style('color', '#fff')
      .style('padding', '4px 8px')
      .style('border-radius', '4px');
    tooltipRef.current = div;
    return () => div.remove();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svg.node().clientWidth;
    const height = +svg.attr('height');
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 10, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.anio))
      .range([margin.left, margin.left + innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.euros) || 0])
      .nice()
      .range([margin.top + innerHeight, margin.top]);

    const line = d3
      .line()
      .x(d => x(d.anio))
      .y(d => y(d.euros));

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#6d9fd0')
      .attr('stroke-width', 2)
      .attr('d', line);

    const first = data[0]?.anio;
    const last = data.at(-1)?.anio;
    const highlightYear = first && last ? Math.round((first + last) / 2) : null;

    const showTip = (d, event) => {
      if (!tooltipRef.current) return;
      tooltipRef.current
        .html(`${d.anio}: ${d.euros.toFixed(2).replace('.', ',')} €/m²`)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY + 10}px`)
        .transition()
        .duration(150)
        .style('opacity', 1);
    };

    const hideTip = () => {
      if (!tooltipRef.current) return;
      tooltipRef.current.transition().duration(150).style('opacity', 0);
    };

    svg
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.anio))
      .attr('cy', d => y(d.euros))
      .attr('r', d => (d.anio === highlightYear ? 5 : 3))
      .attr('fill', d => (d.anio === highlightYear ? '#ffb74d' : '#6d9fd0'))
      .on('mouseenter', (e, d) => showTip(d, e))
      .on('mouseleave', hideTip);

    const xAxis = d3.axisBottom(x).ticks(data.length).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(y).ticks(4);

    svg
      .append('g')
      .attr('transform', `translate(0,${margin.top + innerHeight})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);
  }, [data, selectedProv]);

  return <svg ref={svgRef} width="100%" height={160} role="img" />;
}


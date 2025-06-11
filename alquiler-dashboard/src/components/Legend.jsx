import { useId } from 'react';
import * as d3 from 'd3';

export default function Legend({ domain, interpolator }) {
  const id = useId();
  const gradientId = `grad-${id}`;
  const [min, max] = domain;

  const stops = d3.range(0, 1.01, 0.01).map(t => (
    <stop key={t} offset={`${t * 100}%`} stopColor={interpolator(t)} />
  ));

  return (
    <svg width={200} height={20} aria-label="leyenda" role="img">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%">
          {stops}
        </linearGradient>
      </defs>
      <rect x={0} y={4} width={200} height={12} fill={`url(#${gradientId})`} />
      <text x={0} y={18} fontSize={10} textAnchor="start">
        {min.toFixed ? min.toFixed(0) : min}
      </text>
      <text x={200} y={18} fontSize={10} textAnchor="end">
        {max.toFixed ? max.toFixed(0) : max}
      </text>
    </svg>
  );
}

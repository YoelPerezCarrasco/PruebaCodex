export default function Legend({ scale }) {

  if (scale && typeof scale.invertExtent === 'function') {
    const rects = scale.range();
    const last = scale.invertExtent(rects[rects.length - 1])[1];
    const width = rects.length * 25;
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg
          width={width}
          height={24}
          aria-label="leyenda"
          role="img"
        >
        {rects.map((c, i) => {
          const [t0] = scale.invertExtent(c);
          return (
            <g key={i}>
              <rect x={i * 25} width={24} height={12} fill={c} />
              <text x={i * 25} y={22} fontSize={10} textAnchor="start">
                {t0.toFixed ? t0.toFixed(0) : t0}
              </text>
            </g>
          );
        })}
        <text
          x={rects.length * 25}
          y={22}
          fontSize={10}
          textAnchor="end"
        >
          {last.toFixed ? last.toFixed(0) : last}
        </text>
        </svg>
      </div>
    );
  }

  return null;
}

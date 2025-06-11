export default function Legend({ scale }) {

  if (scale && typeof scale.invertExtent === 'function') {
    const colors = scale.range();
    const stepWidth = 20;
    const last = scale.invertExtent(colors[colors.length - 1])[1];
    return (
      <svg
        width={colors.length * stepWidth}
        height={20}
        aria-label="leyenda"
        role="img"
      >
        {colors.map((c, i) => {
          const [t0] = scale.invertExtent(c);
          return (
            <g key={c}>
              <rect x={i * stepWidth} y={4} width={stepWidth} height={12} fill={c} />
              <text x={i * stepWidth} y={18} fontSize={10} textAnchor="start">
                {t0.toFixed ? t0.toFixed(0) : t0}
              </text>
            </g>
          );
        })}
        <text
          x={colors.length * stepWidth}
          y={18}
          fontSize={10}
          textAnchor="end"
        >
          {last.toFixed ? last.toFixed(0) : last}
        </text>
      </svg>
    );
  }

  return null;
}

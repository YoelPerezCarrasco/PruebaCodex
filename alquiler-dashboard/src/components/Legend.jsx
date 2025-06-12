export default function Legend({ scale }) {
  if (scale && typeof scale.invertExtent === 'function') {
    const rects = scale.range();
    const max = scale.invertExtent(rects[rects.length - 1])[1];

    const width = 220;
    const pad = 6;
    const step = 30;

    return (
      <svg
        width={width}
        height={40}
        aria-label="leyenda"
        role="img"
        style={{ border: '1px solid #444', background: '#1e1e1e' }}
      >
        <g transform={`translate(${pad},${pad})`}>
          <text
            x={(width - pad * 2) / 2}
            y={0}
            dy="0.8em"
            fontSize={10}
            textAnchor="middle"
            fill="#fff"
          >
            €/m²
          </text>
          {rects.map((c, i) => {
            const [t0] = scale.invertExtent(c);
            const x = i * step;
            return (
              <g key={i}>
                <rect x={x} y={8} width={24} height={12} fill={c} />
                <text x={x} y={24} fontSize={10} fill="#fff">
                  {t0.toFixed ? t0.toFixed(1) : t0}
                </text>
              </g>
            );
          })}
          <text
            x={(rects.length - 1) * step + 24}
            y={24}
            fontSize={10}
            textAnchor="end"
            fill="#fff"
          >
            {max.toFixed ? max.toFixed(1) : max}
          </text>
        </g>
      </svg>
    );
  }

  return null;
}

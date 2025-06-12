/* ───── Tarjeta Leyenda: escala de colores €/m² ───── */
export default function Legend({ scale }) {
  if (!scale || typeof scale.invertExtent !== 'function') return null;
  return (
    <svg width="100%" height="70">
      <text x="50%" y="16" textAnchor="middle" fontSize="16" fill="#fff">
        €/m²
      </text>
      {scale.range().map((c, i) => (
        <rect key={i} x={60 + i * 40} y={28} width="40" height="14" fill={c} />
      ))}
      {scale.range().map((c, i) => (
        <text
          key={i}
          x={80 + i * 40}
          y={60}
          textAnchor="middle"
          fontSize="10"
          fill="#ccc"
        >
          {scale.invertExtent(c)[0].toFixed(1)}
        </text>
      ))}
    </svg>
  );
}

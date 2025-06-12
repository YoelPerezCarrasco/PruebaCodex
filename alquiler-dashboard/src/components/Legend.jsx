/* ───── Tarjeta Leyenda: escala de colores €/m² ───── */
export default function Legend({ scale }) {
  if (!scale || typeof scale.invertExtent !== 'function') return null;
  return (
    <svg width="100%" height="60" aria-label="Leyenda de colores">
      <text x="50%" y="14" textAnchor="middle" fill="#fff" fontSize="14">
        €/m²
      </text>
      {scale.range().map((c, i) => (
        <rect key={i} x={40 + i * 30} y={24} width="30" height="12" fill={c} />
      ))}
      {scale.range().map((c, i) => (
        <text
          key={i}
          x={55 + i * 30}
          y={50}
          textAnchor="middle"
          fontSize="10"
          fill="#bbb"
        >
          {scale.invertExtent(c)[0].toFixed(1)}
        </text>
      ))}
    </svg>
  );
}

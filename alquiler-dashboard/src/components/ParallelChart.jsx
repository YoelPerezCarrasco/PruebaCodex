export default function ParallelChart({ data }) {
  return (
    <div className="flex items-center justify-center h-full text-zinc-400">
      {/* TODO: implementar coordenadas paralelas */}
      <p>Gráfico paralelo ({data ? data.length : 0} registros)</p>
    </div>
  );
}

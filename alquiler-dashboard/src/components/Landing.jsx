/* ───── Pantalla Landing: bienvenida ───── */
export default function Landing({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">
        Dashboard Alquiler&nbsp;España
      </h1>
      <p className="mb-6 text-center max-w-md">
        Explora la evolución del precio medio de alquiler por provincia y
        descubre patrones interactivos en tiempo real.
      </p>
      <button className="btn" onClick={onEnter}>Entrar</button>
    </div>
  );
}

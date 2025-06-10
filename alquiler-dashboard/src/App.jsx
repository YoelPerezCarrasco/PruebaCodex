import useAlquilerData from './hooks/useAlquilerData';

function App() {
  const { records, years } = useAlquilerData();

  return (
    <pre>{JSON.stringify({ years, sample: records.slice(0, 3) }, null, 2)}</pre>
  );
}

export default App;

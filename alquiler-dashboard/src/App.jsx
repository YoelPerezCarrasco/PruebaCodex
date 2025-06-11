import { useState } from 'react';
import Map from './components/Map';
import useAlquilerData from './hooks/useAlquilerData';

function App() {
  const { records } = useAlquilerData();
  const [provinciaSel, setProvinciaSel] = useState(null);

  if (!records) return <p>Cargando datos…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Dashboard de alquileres</h1>
      <Map data={records} onSelect={setProvinciaSel} />
      {provinciaSel && <p>Provincia seleccionada: {provinciaSel}</p>}
    </div>
  );
}

export default App;

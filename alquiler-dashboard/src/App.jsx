import { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
import Map from './components/Map';
import Legend from './components/Legend';
import useAlquilerData from './hooks/useAlquilerData';

function App() {
  const { records, years } = useAlquilerData();
  const [year, _setYear] = useState(years[years.length - 1]);
  const [provinciaSel, setProvinciaSel] = useState(null);

  const domain = useMemo(() => {
    const vals = records
      .filter(r => r.anio === year && r.Total != null && !Number.isNaN(+r.Total))
      .map(r => +r.Total);
    return [d3.min(vals), d3.max(vals)];
  }, [records, year]);

  if (!records) return <p>Cargando datos…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Dashboard de alquileres</h1>
      <Legend domain={domain} interpolator={interpolateRdYlBu} />
      <Map data={records} year={year} colorScaleDomain={domain} onSelect={setProvinciaSel} />
      {provinciaSel && <p>Provincia seleccionada: {provinciaSel}</p>}
    </div>
  );
}

export default App;

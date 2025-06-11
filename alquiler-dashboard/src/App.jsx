import { useState, useMemo, useEffect } from 'react';

import * as d3 from 'd3';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
import Map from './components/Map';
import Legend from './components/Legend';
import TimeSlider from './components/TimeSlider';
import useAlquilerData from './hooks/useAlquilerData';

function App() {
  const { records, years, domainPrecio } = useAlquilerData();
  const [year, setYear] = useState(years[years.length - 1]);
  useEffect(() => {
    if (years.length) {
      setYear(y => (y == null ? years[years.length - 1] : y));
    }
  }, [years]);

  const [provinciaSel, setProvinciaSel] = useState(null);

  const domain = useMemo(() => domainPrecio(year), [domainPrecio, year]);

  if (!records || year == null) return <p>Cargando datos…</p>;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Dashboard de alquileres</h1>
      <TimeSlider years={years} year={year} setYear={setYear} />
      <Legend domain={domain} interpolator={interpolateRdYlBu} />
      <Map data={records} year={year} colorScaleDomain={domain} onSelect={setProvinciaSel} />
      {provinciaSel && <p>Provincia seleccionada: {provinciaSel}</p>}
    </div>
  );
}

export default App;

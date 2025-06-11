import { useState, useMemo, useEffect } from 'react';

import Map from './components/Map';
import Legend from './components/Legend';
import TimeSlider from './components/TimeSlider';
import Treemap from './components/Treemap';
import useAlquilerData from './hooks/useAlquilerData';
import createColorScale from './utils/colorScale.js';

function App() {
  const [year, setYear] = useState(null);
  const { records, years, domainPrecio, aggByCca } = useAlquilerData(year);
  useEffect(() => {
    if (years.length) {
      setYear(y => (y == null ? years[years.length - 1] : y));
    }
  }, [years]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [selectedCca, setSelectedCca] = useState(null);

  const domain = useMemo(() => domainPrecio(year), [domainPrecio, year]);
  const colorScale = useMemo(
    () => (domain ? createColorScale(domain) : null),
    [domain]
  );

  if (!records || year == null) return <p>Cargando datos…</p>;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Dashboard de alquileres</h1>
      <TimeSlider years={years} year={year} setYear={setYear} />
      <Legend scale={colorScale} />
      <Treemap
        data={aggByCca}
        selectedCca={selectedCca}
        onSelect={setSelectedCca}
        colorDomain={domain}
      />
      <Map
        data={records}
        year={year}
        colorScaleDomain={domain}
        onSelect={setProvinciaSel}
        selectedCca={selectedCca}
      />
      {provinciaSel && <p>Provincia seleccionada: {provinciaSel}</p>}
    </div>
  );
}

export default App;

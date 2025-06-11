import { useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';

import Map from './components/Map';
import Legend from './components/Legend';
import TimeSlider from './components/TimeSlider';
import Treemap from './components/Treemap';
import './styles/dashboard.css';
import useIndiceData from './hooks/useIndiceData';
import provToCca from './utils/provToCca.js';
import createColorScale from './utils/colorScale.js';

function App() {
  const { records, years, domain } = useIndiceData();
  const [year, setYear] = useState(years.at(-1));
  const [tam, _setTam] = useState('Total');

  useEffect(() => {
    if (years.length) setYear(y => (y == null ? years.at(-1) : y));
  }, [years]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [selectedCca, setSelectedCca] = useState(null);

  const colorDomain = domain(year, tam);
  const colorScale = useMemo(
    () => (colorDomain ? createColorScale(colorDomain) : null),
    [colorDomain]
  );

  const aggByCca = useMemo(() => {
    if (!records || year == null) return [];
    return d3
      .rollups(
        records.filter(r => r.anio === year && r.tamano === tam),
        v => ({
          alquiler: d3.mean(v, d => d.indice),
          poblacion: v.length,
        }),
        d => provToCca[d.cod_provincia]
      )
      .map(([cca, vals]) => ({ cca, ...vals }));
  }, [records, year, tam]);

  if (!records || year == null) return <p>Cargando datos…</p>;


  return (
    <div>
      <h1>Dashboard de alquileres</h1>
      <div className="controls">
        <TimeSlider years={years} year={year} setYear={setYear} />
      </div>

      <div className="grid-dash">
        <div className="card" role="region" aria-label="Leyenda de colores">
          <Legend scale={colorScale} />
        </div>
        <div className="card" role="region" aria-label="Treemap por comunidad">
          <Treemap
            data={aggByCca}
            selectedCca={selectedCca}
            onSelect={setSelectedCca}
            colorDomain={colorDomain}
          />
        </div>
        <div
          className="card"
          style={{ gridColumn: '1 / span 2' }}
          role="region"
          aria-label="Mapa de alquileres por provincia"
        >
          <Map
            data={records}
            year={year}
            tam={tam}
            colorScaleDomain={colorDomain}
            onSelect={setProvinciaSel}
            selectedCca={selectedCca}
          />
        </div>
      </div>
      {provinciaSel && (
        <footer>Provincia seleccionada: {provinciaSel}</footer>
      )}
    </div>
  );
}

export default App;

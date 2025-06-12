import { useState } from 'react';

import Map from './components/Map';
import './styles/dashboard.css';
import useIndiceData from './hooks/useIndiceData';

function App() {
  const { records, years, sizeOptions, getByYearSize, domainEuros } =
    useIndiceData();
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const [year, setYear] = useState(maxYear);
  const [size, setSize] = useState('Total');

  const filtered = getByYearSize(year, size);
  const euroDomain = domainEuros(year, size);

  if (!records.length) return <p>Cargando datos…</p>;

  return (
    <div>
      <h1>Dashboard de alquileres</h1>
      <div className="controls">
        <label>Tamaño:</label>
        <select value={size} onChange={e => setSize(e.target.value)}>
          {sizeOptions.map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <label>Año:</label>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={year}
          onChange={e => setYear(+e.target.value)}
        />
        <span>{year}</span>
      </div>
      <div className="grid-dash">
        {/* <div className="card legend" role="region" aria-label="Leyenda de colores" key="legend"></div> */}
        {/* <div className="card treemap" role="region" aria-label="Treemap por comunidad" key="treemap"></div> */}
        <div
          className="card map"
          role="region"
          aria-label="Mapa de alquileres por provincia"
          key="map"
        >
          <Map filtered={filtered} euroDomain={euroDomain} />
        </div>
      </div>
    </div>
  );
}

export default App;

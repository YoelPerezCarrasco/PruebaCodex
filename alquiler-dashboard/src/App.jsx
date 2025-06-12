import { useState, useMemo, useEffect } from 'react';

import Map from './components/Map';
import Legend from './components/Legend';
import Treemap from './components/Treemap';
import './styles/dashboard.css';
import useIndiceData from './hooks/useIndiceData';
import createColorScale from './utils/colorScale.js';

function App() {
  const { records, years, sizeOptions, getFiltered } = useIndiceData();
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const [from, setFrom] = useState(minYear);
  const [to, setTo] = useState(maxYear);
  const [size, setSize] = useState('Total');

  useEffect(() => {
    if (years.length) {
      setFrom(y => (y == null ? minYear : y));
      setTo(t => (t == null ? maxYear : t));
    }
  }, [years, minYear, maxYear]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [selectedCca, setSelectedCca] = useState(null);

  const filtered = useMemo(
    () => getFiltered({ from, to, size }),
    [getFiltered, from, to, size]
  );
  const vals = filtered.map(d => d.valor);
  const colorDomain = vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
  const colorScale = useMemo(
    () => (colorDomain ? createColorScale(colorDomain) : null),
    [colorDomain]
  );

  if (!records.length) return <p>Cargando datos…</p>;


  return (
    <div>
      <h1>Dashboard de alquileres</h1>
      <div className="controls">
        <label>Tamaño:</label>
        <select value={size} onChange={e => setSize(e.target.value)}>
          <option value="Total">Total</option>
          {sizeOptions.map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <label>Años:</label>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={from}
          onChange={e => setFrom(+e.target.value)}
          aria-label="Desde"
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={to}
          onChange={e => setTo(+e.target.value)}
          aria-label="Hasta"
        />
        <span>{from}-{to}</span>
      </div>

      <div className="grid-dash">
        <div className="card" role="region" aria-label="Leyenda de colores" key="legend">
          <Legend scale={colorScale} />
        </div>
        <div className="card" role="region" aria-label="Treemap por comunidad" key="treemap">
          <Treemap
            filtered={filtered}
            selectedCca={selectedCca}
            onSelect={setSelectedCca}
            colorDomain={colorDomain}
          />
        </div>
        <div
          className="card map"
          style={{ gridColumn: '1 / span 2' }}
          role="region"
          aria-label="Mapa de alquileres por provincia"
          key="map"
        >
          <Map
            filtered={filtered}
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

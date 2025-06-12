import { useState, useMemo, useEffect } from 'react';
import { Range } from 'react-range';
import * as d3 from 'd3';

import Map from './components/Map';
import Legend from './components/Legend';
import Treemap from './components/Treemap';
import LineChart from './components/LineChart';
import './styles/dashboard.css';
import useAlquilerEuros from './hooks/useAlquilerEuros';
import createColorScale from './utils/colorScale.js';
import provToCca from './utils/provToCca.js';

function App() {
  const { records, years, getByYear } = useAlquilerEuros();
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const [range, setRange] = useState([]);

  const STEP = 1;
  const MIN = minYear;
  const MAX = maxYear;

  function YearRange({ values, onChange }) {
    return (
      <Range
        values={values}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={onChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '4px',
              background: '#555',
              margin: '0 0.5rem',
            }}
          >
            {children}
          </div>
        )}
        allowOverlap={false}
        renderThumb={({ key, props }) => (
          <div key={key} {...props} style={{ ...props.style, outline: 'none' }} />
        )}
      />
    );
  }

  useEffect(() => {
    if (years.length && !range.length) {
      setRange([years[0], years.at(-1)]);
    }
  }, [years]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [selectedCca, setSelectedCca] = useState(null);

  const filtered = useMemo(
    () => getByYear(range[0], range[1]),
    [getByYear, range]
  );
  const vals = filtered.map(d => d.euros_m2);
  const colorDomain = vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
  const colorScale = useMemo(
    () => (colorDomain ? createColorScale(colorDomain) : null),
    [colorDomain]
  );

  const serie = useMemo(() => {
    const src = selectedCca
      ? filtered.filter(d => provToCca[d.cod_provincia] === selectedCca)
      : filtered;
    return d3
      .rollups(
        src,
        v => d3.mean(v, d => d.euros_m2),
        d => d.anio
      )
      .map(([anio, euros]) => ({ anio, euros }));
  }, [filtered, selectedCca]);

  if (!records.length) return <p>Cargando datos…</p>;


  return (
    <div>
      <h1>Dashboard de alquileres</h1>
      <div className="controls">
        <label>Años:</label>
          {range.length && (
            <YearRange
              values={range}
              onChange={v => setRange([Math.min(...v), Math.max(...v)])}
            />
          )}
        {range.length && <span>{range[0]} – {range[1]}</span>}
      </div>

      <div className="grid-dash">
        <div className="card legend" role="region" aria-label="Leyenda de colores" key="legend">
          <Legend scale={colorScale} />
        </div>
        <button onClick={() => setSelectedCca(null)} disabled={!selectedCca}>
          Reset CCAA
        </button>
        <div
          className="card treemap"
          role="region"
          aria-label="Treemap por comunidad"
          key="treemap"
          onClick={() => setSelectedCca(null)}
        >
          <Treemap
            filtered={filtered}
            selectedCca={selectedCca}
            onSelect={setSelectedCca}
            colorDomain={colorDomain}
          />
        </div>
        <div className="card line" aria-label="Evolución €/m²" key="line">
          <LineChart data={serie} selectedProv={selectedCca} />
        </div>
        <div
          className="card map"
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

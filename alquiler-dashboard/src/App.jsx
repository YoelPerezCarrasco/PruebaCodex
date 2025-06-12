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
  const { records, years, getFiltered } = useAlquilerEuros();
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const [from, setFrom] = useState();
  const [to, setTo] = useState();

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
        renderThumb={({ key, props }) => (
          <div
            key={key}
            {...props}
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={values[key]}
            style={{
              ...props.style,
              height: '16px',
              width: '16px',
              borderRadius: '50%',
              backgroundColor: '#90caf9',
              outline: 'none',
            }}
          />
        )}
      />
    );
  }

  useEffect(() => {
    if (years.length) {
      setFrom(years[0]);
      setTo(years.at(-1));
    }
  }, [years]);

  const [provinciaSel, setProvinciaSel] = useState(null);
  const [selectedCca, setSelectedCca] = useState(null);

  const filtered = useMemo(
    () => getFiltered({ from, to }),
    [getFiltered, from, to]
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
        {from != null && to != null && (
          <YearRange
            values={[from, to]}
            onChange={([f, t]) => {
              setFrom(f);
              setTo(t);
            }}
          />
        )}
        <span>{from} – {to}</span>
      </div>

      <div className="grid-dash">
        <div className="card legend" role="region" aria-label="Leyenda de colores" key="legend">
          <Legend scale={colorScale} />
        </div>
        <div className="card treemap" role="region" aria-label="Treemap por comunidad" key="treemap">
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

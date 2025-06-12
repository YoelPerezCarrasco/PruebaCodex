import { useState, useMemo, useEffect } from 'react';

import Landing from './components/Landing';

import Map from './components/Map';
import Legend from './components/Legend';
import Treemap from './components/Treemap';
import DensityLine from './components/DensityLine';
import Scatter from './components/Scatter';
import './styles/dashboard.css';
import useAlquilerEuros from './hooks/useAlquilerEuros';
import useIndiceData from './hooks/useIndiceData';
import createColorScale from './utils/colorScale.js';
import provinceNames from './utils/provinceNames.js';
import provToCca from './utils/provToCca.js';

function App() {
  const [showDash, setShowDash] = useState(false);
  const { records, years } = useAlquilerEuros();
  const { records: indiceRecords } = useIndiceData();
  const [year, setYear] = useState();

  useEffect(() => {
    if (years.length && year == null) setYear(years.at(-1));
  }, [years, year]);


  const [provinciaSel, setProvinciaSel] = useState(null);
  const [selectedCca, setSelectedCca] = useState(null);

  const filtered = useMemo(
    () => (year != null ? records.filter(d => d.anio === year) : []),
    [records, year]
  );

  const baseData = useMemo(
    () =>
      selectedCca
        ? filtered.filter(d => provToCca[d.cod_provincia] === selectedCca)
        : filtered,
    [filtered, selectedCca]
  );
  const vals = filtered.map(d => d.euros_m2);
  const colorDomain = vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
  const colorScale = useMemo(
    () => (colorDomain ? createColorScale(colorDomain) : null),
    [colorDomain]
  );

  const lineData = baseData.map(d => d.euros_m2);
  const yearMid = year;
  const scatterPts = useMemo(() => {
    if (!indiceRecords.length || yearMid == null) return [];
    return indiceRecords
      .filter(
        d =>
          d.anio === yearMid &&
          d.tam === 'Total' &&
          (!selectedCca || provToCca[d.cod_provincia] === selectedCca)
      )
      .map(d => ({
        prov: provinceNames[d.cod_provincia] || d.cod_provincia,
        euros: d.euros,
        indice: d.valor,
      }));
  }, [indiceRecords, year, selectedCca]);

  if (!showDash) return <Landing onEnter={() => setShowDash(true)} />;


  if (!records.length) return <p>Cargando datos…</p>;

  return (
    <div className="dashboard-wrap">
      {/* Fila 1 */}
      <div className="dashboard-row">
        <div
          className="card map"
          role="region"
          aria-label="Mapa de alquileres por provincia"
        >
          <Map
            filtered={filtered}
            colorScaleDomain={colorDomain}
            onSelect={setProvinciaSel}
            selectedCca={selectedCca}
          />
        </div>
      </div>

      {/* Slider 1 thumb centrado bajo mapa */}
      {year != null && (
        <input
          type="range"
          min={years[0]}
          max={years.at(-1)}
          value={year}
          onChange={e => setYear(+e.target.value)}
          className="w-full accent-emerald-500 mt-2"
        />
      )}
      <div className="text-center mt-1">{year}</div>
      <button
        onClick={() => setSelectedCca(null)}
        disabled={!selectedCca}
        className="btn mt-2"
      >
        Reset CCAA
      </button>

      {/* Leyenda centrada */}
      <div className="card legend">
        <Legend scale={colorScale} />
      </div>

      {/* Fila 2 */}
      <div className="dashboard-row">
        <div
          className="card treemap"
          role="region"
          aria-label="Treemap por comunidad"
          onClick={() => setSelectedCca(null)}
        >
          <Treemap
            filtered={filtered}
            selectedCca={selectedCca}
            onSelect={setSelectedCca}
            colorDomain={colorDomain}
          />
        </div>
        <div className="card scatter">
          <Scatter points={scatterPts} selectedCca={selectedCca} />
        </div>
        <div className="card line">
          <DensityLine data={lineData} />
        </div>
      </div>
      {provinciaSel && (
        <footer className="mt-2">Provincia seleccionada: {provinciaSel}</footer>
      )}
    </div>
  );
}

export default App;

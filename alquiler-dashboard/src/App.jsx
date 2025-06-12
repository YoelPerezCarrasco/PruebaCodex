import { useState, useMemo, useEffect } from 'react';

import Landing from './components/Landing';

import Map from './components/Map';
import Header from './components/Header';
import Treemap from './components/Treemap';
import TabsPanel from './components/TabsPanel';
import './styles/dashboard.css';
import useAlquilerEuros from './hooks/useAlquilerEuros';
import useIndiceData from './hooks/useIndiceData';
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
    <>
      {/* ===== Barra superior ===== */}
      <Header />

      {/* ===== Grid principal ===== */}
      <div className="grid-main">
        {/* ── Mapa grande (pivote del dashboard) ── */}
        <div className="card map" role="region" aria-label="Mapa de alquileres por provincia">
          <Map
            filtered={filtered}
            colorScaleDomain={colorDomain}
            onSelect={setProvinciaSel}
            selectedCca={selectedCca}
          />
        </div>

        {/* ── Treemap: reparto CCAA ── */}
        <div className="card treemap" role="region" aria-label="Treemap por comunidad" onClick={() => setSelectedCca(null)}>
          <Treemap
            filtered={filtered}
            selectedCca={selectedCca}
            onSelect={setSelectedCca}
            colorDomain={colorDomain}
          />
        </div>

        {/* ── Panel con Tabs (Paralelo / Scatter / Densidad) ── */}
        <div className="card panel">
          <TabsPanel
            serieParalelo={filtered}
            serieScatter={scatterPts}
            serieDens={lineData}
          />
        </div>
      </div>

      {/* ===== Selector de AÑO único + play ===== */}
      <div className="max-w-4xl mx-auto mt-2 px-4">
        <input
          type="range"
          min={years[0]}
          max={years.at(-1)}
          value={year}
          onChange={e => setYear(+e.target.value)}
          className="range-bar"
        />
        <p className="text-center mt-1">{year}</p>
      </div>

      {provinciaSel && (
        <footer className="mt-2 col-span-full text-center">Provincia seleccionada: {provinciaSel}</footer>
      )}
    </>
  );
}

export default App;

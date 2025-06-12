import { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

const DATA_URL = '/src/data/indices_provinciales.csv';
const BASE_URL = '/src/data/alquiler_base_2015.csv';

export default function useIndiceData() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    Promise.all([
      d3.dsv(';', DATA_URL, row => ({
        anio: +row.Periodo,
        tam: row['Tamaño de la vivienda'],
        cod_provincia: (row.Provincias.match(/^\d{2}/) ?? ['00'])[0],
        valor: +row.Total.replace(',', '.'),
      })),
      d3.dsv(';', BASE_URL, r => ({
        cod: r.cod_provincia,
        euros: +r.euros.replace(',', '.'),
      })),
    ]).then(([data, base]) => {
      const map = new Map(base.map(b => [b.cod, b.euros]));
      const merged = data.map(d => {
        const b = map.get(d.cod_provincia);
        const euros = b != null && !Number.isNaN(d.valor) ? (b * d.valor) / 100 : null;
        return { ...d, euros };
      });
      setRecords(merged);
    });
  }, []);

  const years = useMemo(() => {
    if (!records.length) return [];
    const min = d3.min(records, d => d.anio);
    const max = d3.max(records, d => d.anio);
    const out = [];
    for (let y = min; y <= max; y++) out.push(y);
    return out;
  }, [records]);

  const sizeOptions = useMemo(
    () => Array.from(new Set(records.map(d => d.tam))),
    [records]
  );

  const getFiltered = useCallback(
    ({ from, to, size }) =>
      records.filter(
        d => d.anio >= from && d.anio <= to && d.tam === size
      ),
    [records]
  );

  const domain = useCallback(filtered => {
    const vals = filtered.map(d => d.valor).filter(v => !Number.isNaN(v));
    return d3.extent(vals);
  }, []);

  return { records, years, sizeOptions, getFiltered, domain };
}

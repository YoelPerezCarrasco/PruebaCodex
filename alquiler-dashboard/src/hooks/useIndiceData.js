import { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { dsvFormat } from 'd3-dsv';
import csvRaw from '../../public/indices_provinciales.csv?raw';

const BASE_URL = '/src/data/alquiler_base_2015.csv';

export default function useIndiceData() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    async function load() {
      const parse = dsvFormat(';').parse;
      const data = parse(csvRaw, row => {
        const tamKey = Object.keys(row).find(k =>
          k.replace(/�/g, 'ñ').toLowerCase().startsWith('tamaño')
        );
        const tam = tamKey ? row[tamKey].trim() : 'Total';

        // DEBUG – dejar 1 semana
        if (!tamKey && window.__warnOnce !== true) {
          console.warn('Columna tamaño no encontrada en fila', row);
          window.__warnOnce = true;
        }

        const m = row.Provincias.match(/^\d{2}/);
        if (!m) return;
        const valor = +row.Total.replace(',', '.');
        if (Number.isNaN(valor)) return;
        return {
          anio: +row.Periodo,
          tam,
          cod_provincia: m[0],
          valor,
        };
      });

      console.log('Filas válidas', data.length);
      console.log('Tams únicos', [...new Set(data.map(d => d.tam))]);
      const base = await d3.dsv(';', BASE_URL, r => ({
        cod: r.cod_provincia,
        euros: +r.euros.replace(',', '.'),
      }));
      const map = new Map(base.map(b => [b.cod, b.euros]));
      const merged = data.map(d => {
        const b = map.get(d.cod_provincia);
        const euros = b != null && !Number.isNaN(d.valor) ? (b * d.valor) / 100 : null;
        return { ...d, euros };
      });
      setRecords(merged);
    }
    load();
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
    () => [...new Set(records.map(d => d.tam))].sort(),
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

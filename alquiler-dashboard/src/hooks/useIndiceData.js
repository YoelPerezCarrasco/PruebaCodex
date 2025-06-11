import { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

const DATA_URL = '/src/data/indices_provinciales.csv';

export default function useIndiceData() {
  const [records, setRecords] = useState(null);

  useEffect(() => {
    d3.dsv(';', DATA_URL, d => {
      const cleaned = {};
      for (const key in d) {
        if (!Object.prototype.hasOwnProperty.call(d, key)) continue;
        let val = d[key];
        if (typeof val === 'string') {
          val = val.trim().replace(',', '.');
          if (val === '' || val === '..') val = NaN;
        }
        const num = +val;
        cleaned[key] = Number.isNaN(num) ? val : num;
      }
      cleaned.anio = +cleaned.Periodo;
      if (d.Provincias) {
        const [cod, ...rest] = d.Provincias.split(' ');
        cleaned.cod_provincia = cod ? cod.padStart(2, '0') : null;
        cleaned.provincia = rest.join(' ');
      }
      cleaned.tamano = d['Tamaño de la vivienda'];
      cleaned.indice = +cleaned.Total;
      return cleaned;
    }).then(data => setRecords(data));
  }, []);

  const years = useMemo(() => {
    if (!records) return [];
    return Array.from(new Set(records.map(d => d.anio))).sort((a, b) => a - b);
  }, [records]);

  const provincias = useMemo(() => {
    if (!records) return [];
    return Array.from(
      new Set(records.map(d => d.cod_provincia).filter(Boolean))
    ).sort();
  }, [records]);

  const tamanoOptions = useMemo(() => {
    if (!records) return [];
    return Array.from(new Set(records.map(d => d.tamano)));
  }, [records]);

  const domain = useCallback(
    (anio, tam) => {
      if (!records) return [NaN, NaN];
      const values = records
        .filter(r => r.anio === anio && r.tamano === tam)
        .map(r => r.indice)
        .filter(v => !Number.isNaN(v));
      return d3.extent(values);
    },
    [records]
  );

  return useMemo(
    () => ({ records: records || [], years, provincias, tamanoOptions, domain }),
    [records, years, provincias, tamanoOptions, domain]
  );
}

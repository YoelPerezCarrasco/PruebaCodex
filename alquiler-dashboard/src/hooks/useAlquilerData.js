import { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

const DATA_URL = '/src/data/alquiler_capitales.csv';

export default function useAlquilerData() {
  const [records, setRecords] = useState(null);

  useEffect(() => {
    d3.dsv(';', DATA_URL, row => {
      const cleaned = {};
      for (const key in row) {
        if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
        let value = row[key];
        if (typeof value === 'string') {
          value = value.trim().replace(',', '.');
          if (value === '' || value === '..') {
            value = NaN;
          }
        }
        const num = +value;
        cleaned[key] = Number.isNaN(num) ? value : num;
      }
      cleaned.anio = cleaned['Periodo'] ? parseInt(cleaned['Periodo'], 10) : NaN;
      if ('Sup_m2' in cleaned) {
        const sup = +cleaned.Sup_m2;
        const total = +cleaned.Total;
        cleaned.precio_m2 = !Number.isNaN(total) && !Number.isNaN(sup) ? total / sup : NaN;
      }
      cleaned.var_pct = NaN; // placeholder, will be computed later
      return cleaned;
    }).then(data => {
      // compute var_pct
      const byGroup = d3.group(data, d => d.Municipio, d => d['Tipo de dato']);
      for (const [, tipoMap] of byGroup) {
        for (const [, rows] of tipoMap) {
          rows.sort((a, b) => a.anio - b.anio);
          for (let i = 1; i < rows.length; i++) {
            const prev = rows[i - 1];
            const curr = rows[i];
            const prevVal = +prev.Total;
            const currVal = +curr.Total;
            curr.var_pct = !Number.isNaN(prevVal) && !Number.isNaN(currVal)
              ? ((currVal - prevVal) / prevVal) * 100
              : NaN;
          }
        }
      }
      setRecords(data);
    });
  }, []);

  const years = useMemo(() => {
    if (!records) return [];
    return Array.from(new Set(records.map(d => d.anio))).sort((a, b) => a - b);
  }, [records]);

  const provincias = useMemo(() => {
    if (!records) return [];
    const provSet = new Set();
    for (const d of records) {
      const match = /^\d{2}/.exec(d.Municipio);
      if (match) provSet.add(match[0]);
    }
    return Array.from(provSet).sort();
  }, [records]);

  const domainPrecio = useCallback((anio) => {
    if (!records) return [NaN, NaN];
    const values = records
      .filter(d => d.anio === anio)
      .map(d => +d.Total)
      .filter(v => !Number.isNaN(v));
    return d3.extent(values);
  }, [records]);

  return useMemo(() => ({
    records: records || [],
    years,
    provincias,
    domainPrecio,
  }), [records, years, provincias, domainPrecio]);
}

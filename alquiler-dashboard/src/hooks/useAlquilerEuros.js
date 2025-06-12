import { useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import csvRaw from '../../public/alquiler_euros_prov_2011_2023.csv?raw';

export default function useAlquilerEuros() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const parse = d3.dsvFormat(',').parse;
    const data = parse(csvRaw, r => ({
      cod_provincia: r.cod_provincia,
      provincia: r.provincia,
      anio: +r.anio,
      euros_m2: +r.euros_m2,
    }));
    setRecords(data);
  }, []);

  const years = useMemo(() => {
    if (!records.length) return [];
    const min = d3.min(records, d => d.anio);
    const max = d3.max(records, d => d.anio);
    const out = [];
    for (let y = min; y <= max; y++) out.push(y);
    return out;
  }, [records]);

  const getFiltered = useCallback(
    ({ from, to }) => records.filter(d => d.anio >= from && d.anio <= to),
    [records]
  );

  const getByYear = useCallback(
    (from, to) => records.filter(r => r.anio >= from && r.anio <= to),
    [records]
  );

  const domain = useCallback(filtered => {
    const vals = filtered.map(d => d.euros_m2).filter(v => !Number.isNaN(v));
    return d3.extent(vals);
  }, []);

  return { records, years, getFiltered, getByYear, domain };
}

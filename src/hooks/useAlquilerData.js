import { useEffect, useState, useMemo } from 'react';
import { dsv } from 'd3';

const csvUrl = new URL('../data/alquiler_capitales.csv', import.meta.url);

let dataCache = null;

function parseRow(row) {
  const parsed = { ...row };
  // Normalize numeric values
  for (const key of Object.keys(parsed)) {
    if (key === 'provincia') continue;
    let value = parsed[key];
    if (typeof value === 'string') {
      if (value.trim() === '...') {
        parsed[key] = NaN;
        continue;
      }
      // replace comma decimal separator
      const replaced = value.replace(',', '.');
      const num = +replaced;
      parsed[key] = isNaN(num) ? replaced : num;
    }
  }
  if (parsed.year) parsed.year = +parsed.year;
  return parsed;
}

async function loadData() {
  if (dataCache) return dataCache;
  const records = await dsv(';', csvUrl);
  dataCache = records.map(parseRow);
  return dataCache;
}

export async function getByProvincia(provincia, year) {
  const records = await loadData();
  return records.filter(
    (d) => d.provincia === provincia && (year === undefined || d.year === year)
  );
}

export async function getYears() {
  const records = await loadData();
  return Array.from(new Set(records.map((d) => d.year))).sort();
}

export default function useAlquilerData() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadData().then(setRecords);
  }, []);

  const years = useMemo(() => Array.from(new Set(records.map((d) => d.year))).sort(), [records]);
  const provincias = useMemo(
    () => Array.from(new Set(records.map((d) => d.provincia))),
    [records]
  );

  return useMemo(
    () => ({ records, years, provincias }),
    [records, years, provincias]
  );
}

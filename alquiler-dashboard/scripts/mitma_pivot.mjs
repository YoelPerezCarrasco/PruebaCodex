import fs from 'fs';
import { parse } from 'csv-parse/sync';

const raw = fs.readFileSync('src/data/precio_alquileres_provincia.csv', 'utf8');
const rows = parse(raw, { columns: true, delimiter: ';' });

const toNum = s => (s ? +s.replace(',', '.') : null);

const out = [];
rows.forEach(r => {
  const cproKey = Object.keys(r).find(k => k.replace(/^\uFEFF/, '') === 'CPRO');
  const litKey = Object.keys(r).find(k => k.includes('LITPRO'));
  const cod = String(r[cproKey]).padStart(2, '0');
  const prov = (r[litKey] || '').trim();
  for (let y = 11; y <= 23; y++) {
    const col = `ALQM2_LV_M_VC_${y}`;
    if (r[col]) {
      const num = toNum(r[col]);
      if (!Number.isNaN(num)) {
        out.push({
          cod_provincia: cod,
          provincia: prov,
          anio: 2000 + y,
          euros_m2: num,
        });
      }
    }
  }
});

const csvContent =
  'cod_provincia,provincia,anio,euros_m2\n' +
  out.map(o => `${o.cod_provincia},${o.provincia},${o.anio},${o.euros_m2}`).join('\n');
fs.writeFileSync('public/alquiler_euros_prov_2011_2023.csv', csvContent);
console.log('\u2714 CSV listo: public/alquiler_euros_prov_2011_2023.csv');


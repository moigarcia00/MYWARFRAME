import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { HELMETS } from '../src/data/helmets.js';
import { SKINS } from '../src/data/skins.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(__dirname, '../../backend/scripts/data/cosmetics.json');

function buildRows(catalog, kind) {
  const rows = new Map();

  for (const [warframe, items] of Object.entries(catalog)) {
    for (const item of items) {
      if (item.nombre === 'Original') continue;

      const img = (item.img || '').trim();
      const isRemote = /^https?:\/\//i.test(img);
      const key = `${warframe}|${kind}|${item.nombre}`;

      rows.set(key, {
        warframe,
        kind,
        name: item.nombre,
        image_local: img && !isRemote ? img : null,
        image_cdn: isRemote ? img : null,
        description: item.desc || '',
      });
    }
  }

  return [...rows.values()];
}

const rows = [...buildRows(SKINS, 'skin'), ...buildRows(HELMETS, 'helmet')];

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

const skins = rows.filter((row) => row.kind === 'skin').length;
const helmets = rows.filter((row) => row.kind === 'helmet').length;
console.log(`Exportadas ${rows.length} filas (${skins} skins, ${helmets} helmets)`);
console.log(`Archivo: ${outFile}`);

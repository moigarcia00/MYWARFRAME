import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODS_URL = 'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json';
const I18N_URL = 'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/i18n/es.json';
const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'modStatsEs.json');

const [mods, es] = await Promise.all([
  fetch(MODS_URL).then((response) => response.json()),
  fetch(I18N_URL).then((response) => response.json())
]);

const statsByUniqueName = {};
for (const mod of mods) {
  const stats = es[mod.uniqueName]?.levelStats?.at(-1)?.stats;
  if (Array.isArray(stats) && stats.length > 0) statsByUniqueName[mod.uniqueName] = stats;
}

const json = `${JSON.stringify(statsByUniqueName)}\n`;
writeFileSync(OUTPUT, json);
console.log(`Generadas las estadísticas ES de ${Object.keys(statsByUniqueName).length} mods (${(json.length / 1024).toFixed(0)} KB).`);

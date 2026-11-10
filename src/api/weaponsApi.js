// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — datos de Armas
// Mismo patrón que warframeApi.js: pide ES + EN en paralelo y
// combina ambos para traducir todo lo que sea posible.
// ══════════════════════════════════════════════════════════
import {
  fetchLang,
  mergeTextFields,
  makeCache,
  dedupeRequest,
  imageUrl as sharedImageUrl
} from './apiCore';

const CACHE = makeCache('mywarframe_weapons_cache_v2', 1000 * 60 * 60 * 12); // 12 horas

const TEXT_FIELDS = ['description'];

// Categorías de armas que nos interesan mostrar en el catálogo. Cualquier
// otra categoría que devuelva la API (por ejemplo "Sentinels" con robots
// enteros, no armas) se descarta aquí.
const INCLUDED_CATEGORIES = new Set([
  'Primary',
  'Secondary',
  'Melee',
  'Archwing',
  'Arch-Gun',
  'Arch-Melee',
  'Robotic',
  'Amp'
]);

function mergeItem(esItem, enItem) {
  let merged = { ...enItem, ...esItem };
  merged = mergeTextFields(merged, esItem, enItem, TEXT_FIELDS);
  merged.nameEn = enItem?.name;
  return merged;
}

function mergeDatasets(esData, enData) {
  const enByUnique = new Map(enData.map((it) => [it.uniqueName, it]));
  return esData
    .filter((it) => INCLUDED_CATEGORIES.has(it.category))
    .map((esItem) => {
      const enItem = enByUnique.get(esItem.uniqueName) || esItem;
      const merged = mergeItem(esItem, enItem);
      merged.id = merged.uniqueName || merged.name;
      return merged;
    });
}

export async function getWeapons({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('weapons', async () => {
    const [esData, enData] = await Promise.all([
      fetchLang('weapons', 'es'),
      fetchLang('weapons', 'en')
    ]);

    const merged = mergeDatasets(esData, enData).sort((a, b) =>
      a.name.localeCompare(b.name, 'es')
    );

    CACHE.write(merged);
    return merged;
  });
}

export function clearWeaponsCache() {
  CACHE.clear();
}

export const imageUrl = sharedImageUrl;

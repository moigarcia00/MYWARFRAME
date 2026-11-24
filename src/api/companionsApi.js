// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — datos de Compañeros
// (Sentinels robóticos + Kubrow/Kavat/Predasite/Vulpaphyla)
//
// La API no tiene un endpoint /companions dedicado — vienen dentro del
// catálogo general /items (todo el juego junto), así que aquí se pide
// ese endpoint y se filtra en el cliente por categoría. No he podido
// probar la API en vivo: uso "Sentinels" y "Pets" como los valores de
// `category` más probables según cómo etiqueta normalmente WFCD estas
// cosas, con detección de respaldo por `type` (Sentinel/Kubrow/Kavat/
// MOA/Predasite/Vulpaphyla) por si el nombre de categoría real es otro.
// Si al probarlo esta pestaña sale vacía o con cosas de más, dime qué
// ves y lo afino con datos reales, como hemos hecho con Armas/Mods.
// ══════════════════════════════════════════════════════════
import {
  fetchLang,
  mergeTextFields,
  makeCache,
  dedupeRequest,
  imageUrl as sharedImageUrl
} from './apiCore';

const CACHE = makeCache('mywarframe_companions_cache_v3', 1000 * 60 * 60 * 12); // 12 horas

const TEXT_FIELDS = ['description'];

const CATEGORY_HINTS = ['SENTINELS', 'PETS', 'COMPANIONS'];
const TYPE_HINTS = ['SENTINEL', 'KUBROW', 'KAVAT', 'MOA', 'PREDASITE', 'VULPAPHYLA', 'HOUND'];

// Estos son recursos de crafteo/caza relacionados con compañeros, pero
// NO son compañeros en sí — se excluyen aquí para que caigan en Objetos
// en vez de en esta pestaña (aunque su category/type de la API los
// agrupe junto a los Kubrow/Kavat de verdad).
const NOT_A_COMPANION = /antiserum|ant[ií]geno|mutagen|mutágeno/i;

function isCompanion(it) {
  if (NOT_A_COMPANION.test(it?.name || '')) return false;
  const category = String(it?.category || '').toUpperCase();
  const type = String(it?.type || '').toUpperCase();
  if (CATEGORY_HINTS.includes(category)) return true;
  return TYPE_HINTS.some((hint) => type.includes(hint));
}

function mergeItem(esItem, enItem) {
  let merged = { ...enItem, ...esItem };
  merged = mergeTextFields(merged, esItem, enItem, TEXT_FIELDS);
  merged.nameEn = enItem?.name;
  return merged;
}

function mergeDatasets(esData, enData) {
  const enByUnique = new Map(enData.map((it) => [it.uniqueName, it]));
  const seen = new Set();
  const out = [];
  esData.filter(isCompanion).forEach((esItem) => {
    const enItem = enByUnique.get(esItem.uniqueName) || esItem;
    const merged = mergeItem(esItem, enItem);
    merged.id = merged.uniqueName || merged.name;
    if (seen.has(merged.id)) return;
    seen.add(merged.id);
    out.push(merged);
  });
  return out;
}

const ONLY_FIELDS =
  'uniqueName,name,type,category,description,health,shield,armor,power,energy,masteryReq,polarities,abilities,vaulted,imageName,wikiaThumbnail,productCategory';

export async function getCompanions({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('companions', async () => {
    const [esData, enData] = await Promise.all([
      fetchLang('items', 'es', { only: ONLY_FIELDS }),
      fetchLang('items', 'en', { only: ONLY_FIELDS })
    ]);

    const merged = mergeDatasets(esData, enData).sort((a, b) => a.name.localeCompare(b.name, 'es'));

    CACHE.write(merged);
    return merged;
  });
}

export function clearCompanionsCache() {
  CACHE.clear();
}

export const imageUrl = sharedImageUrl;

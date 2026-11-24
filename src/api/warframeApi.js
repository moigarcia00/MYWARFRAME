// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — datos de Warframes
// Pide datos en español (language=es) y en inglés (fallback),
// y combina ambos para traducir todo lo que sea posible.
// ══════════════════════════════════════════════════════════
import {
  fetchLang,
  isEmpty,
  mergeTextFields,
  makeCache,
  dedupeRequest,
  imageUrl as sharedImageUrl
} from './apiCore';

const CACHE = makeCache('mywarframe_warframes_cache_v3', 1000 * 60 * 60 * 12); // 12 horas

// Campos de texto que intentamos traducir combinando ES + EN
const TEXT_FIELDS = ['description', 'passiveDescription'];

function mergeAbilities(esAbilities, enAbilities) {
  const en = Array.isArray(enAbilities) ? enAbilities : [];
  const es = Array.isArray(esAbilities) ? esAbilities : [];
  const total = Math.max(es.length, en.length);
  return Array.from({ length: total }, (_, idx) => {
    const esAbility = es[idx] || {};
    const enAbility = en[idx] || {};
    return {
      name: !isEmpty(esAbility.name) ? esAbility.name : enAbility.name,
      description: !isEmpty(esAbility.description)
        ? esAbility.description
        : enAbility.description,
      // Guardamos también el nombre original en inglés, útil para buscar
      // iconos / wiki si algún día hace falta.
      nameEn: enAbility.name
    };
  });
}

function mergeItem(esItem, enItem) {
  let merged = { ...enItem, ...esItem };
  merged = mergeTextFields(merged, esItem, enItem, TEXT_FIELDS);
  merged.abilities = mergeAbilities(esItem?.abilities, enItem?.abilities);
  merged.nameEn = enItem?.name;
  return merged;
}

// Entradas que la API devuelve dentro de la categoría "Warframes" pero que
// no son un warframe jugable propiamente dicho (p.ej. el sistema Helminth).
const EXCLUDED_NAMES = ['helminth'];

function isRealWarframe(it) {
  if (it.category !== 'Warframes' && it.type !== 'Warframe') return false;
  const name = String(it.name || '').toLowerCase();
  return !EXCLUDED_NAMES.some((excluded) => name === excluded);
}

function mergeDatasets(esData, enData) {
  const enByUnique = new Map(enData.map((it) => [it.uniqueName, it]));
  return esData
    .filter(isRealWarframe)
    .map((esItem) => {
      const enItem = enByUnique.get(esItem.uniqueName) || esItem;
      const merged = mergeItem(esItem, enItem);
      // id estable usado para localStorage (colección, maestría, skins...)
      merged.id = merged.uniqueName || merged.name;
      return merged;
    });
}

export async function getWarframes({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('warframes', async () => {
    const [esData, enData] = await Promise.all([
      fetchLang('warframes', 'es'),
      fetchLang('warframes', 'en')
    ]);

    const merged = mergeDatasets(esData, enData).sort((a, b) =>
      a.name.localeCompare(b.name, 'es')
    );

    CACHE.write(merged);
    return merged;
  });
}

export function clearWarframesCache() {
  CACHE.clear();
}

export const imageUrl = sharedImageUrl;

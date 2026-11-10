// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — Objetos (recursos, planos, gear...)
//
// Igual que Compañeros: no hay endpoint dedicado, así que se pide el
// catálogo general /items y se filtra en el cliente. Se EXCLUYEN aquí
// las categorías que ya tienen su propia pestaña (Warframes, armas,
// mods, compañeros, reliquias) para no duplicar catálogos.
//
// No he podido probar la API en vivo — los valores de `category` que
// uso ("Resources", "Skins", "Gear"...) son mi mejor suposición según
// cómo etiqueta normalmente WFCD estas cosas. Si algo sale raro, dímelo
// y lo afino con datos reales.
// ══════════════════════════════════════════════════════════
import {
  fetchLang,
  mergeTextFields,
  makeCache,
  dedupeRequest,
  imageUrl as sharedImageUrl
} from './apiCore';

const CACHE = makeCache('mywarframe_objects_cache_v4', 1000 * 60 * 60 * 12); // 12 horas

const TEXT_FIELDS = ['description'];

// Categorías que YA tienen su propia pestaña en la app — se excluyen
// aquí para no duplicar catálogos.
const EXCLUDED_CATEGORIES = new Set([
  'WARFRAMES',
  'PRIMARY',
  'SECONDARY',
  'MELEE',
  'ARCHWING',
  'ARCH-GUN',
  'ARCH-MELEE',
  'MODS',
  'SENTINELS',
  'PETS',
  'COMPANIONS',
  'RELICS'
]);

const EXCLUDED_TYPE_HINTS = ['RIVEN', 'SENTINEL', 'KUBROW', 'KAVAT', 'MOA', 'PREDASITE', 'VULPAPHYLA'];

// Excepción a la exclusión: estos son recursos de crafteo/caza (no
// compañeros de verdad), pero la API los agrupa junto a los Kubrow/Kavat
// reales — así que aunque su category/type coincida con lo excluido, se
// fuerza su inclusión aquí como Objeto.
const FORCE_INCLUDE = /antiserum|ant[ií]geno|mutagen|mutágeno/i;

function isObject(it) {
  if (!it?.name) return false;
  if (FORCE_INCLUDE.test(it.name)) return true;
  const category = String(it?.category || '').toUpperCase();
  if (EXCLUDED_CATEGORIES.has(category)) return false;
  const type = String(it?.type || '').toUpperCase();
  if (EXCLUDED_TYPE_HINTS.some((hint) => type.includes(hint))) return false;
  return true;
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
  esData.filter(isObject).forEach((esItem) => {
    const enItem = enByUnique.get(esItem.uniqueName) || esItem;
    const merged = mergeItem(esItem, enItem);
    merged.id = merged.uniqueName || merged.name;
    if (seen.has(merged.id)) return;
    seen.add(merged.id);
    out.push(merged);
  });
  return out;
}

const ONLY_FIELDS = 'uniqueName,name,type,category,description,imageName,wikiaThumbnail,tradable';

export async function getObjects({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('objects', async () => {
    const [esData, enData] = await Promise.all([
      fetchLang('items', 'es', { only: ONLY_FIELDS }),
      fetchLang('items', 'en', { only: ONLY_FIELDS })
    ]);

    const merged = mergeDatasets(esData, enData).sort((a, b) => a.name.localeCompare(b.name, 'es'));

    CACHE.write(merged);
    return merged;
  });
}

export function clearObjectsCache() {
  CACHE.clear();
}

export const imageUrl = sharedImageUrl;

// ══════════════════════════════════════════════════════════
// PLANOS de warframes y armas — sacados de item.components, no de
// /items. Los planos (Neuróptica, Chasis, Sistemas, el plano principal)
// suelen venir anidados dentro de cada warframe/arma en vez de existir
// como entradas sueltas en el catálogo general, así que se extraen aquí
// a partir de los datos que ya tienes cargados en las pestañas
// Warframes/Armas — no hace falta pedir nada más a la API.
//
// Best-effort: no he podido confirmar en vivo el nombre exacto de los
// campos de un componente (asumo name/itemCount/imageName/wikiaThumbnail
// /ducats/tradable, que es lo habitual en los datos de WFCD) — si algún
// plano sale con el nombre raro o sin imagen, pásame el JSON de un
// warframe/arma con `components` y lo ajusto.
// ══════════════════════════════════════════════════════════
function isBlueprintComponent(name) {
  return /blueprint|plano/i.test(name || '');
}

// Las armas Kuva, Tenet y Coda no se consiguen construyendo un plano
// como las Prime — se obtienen directamente al derrotar al Sicario
// Kuva/Hermana de Parvos/jefe correspondiente, sin pasar por reliquias
// ni por comprar partes en el mercado. Aunque los datos de WFCD a veces
// listen un "Blueprint" dentro de sus components, no es un plano en el
// mismo sentido que el de un warframe/arma Prime, así que se excluyen
// aquí explícitamente (confirmado por el propio jugador).
const NOT_BLUEPRINT_WEAPON = /^(kuva|tenet|coda)\s/i;

export function extractBlueprints(warframes = [], weapons = []) {
  const out = [];
  const seen = new Set();

  [...warframes, ...weapons].forEach((parent) => {
    if (!Array.isArray(parent.components)) return;
    if (NOT_BLUEPRINT_WEAPON.test(parent.name || '')) return;

    parent.components.forEach((comp) => {
      if (!isBlueprintComponent(comp.name)) return;

      // Algunos componentes ya traen el nombre completo ("Voruna Prime
      // Neuroptics Blueprint"), otros solo la pieza ("Neuroptics
      // Blueprint") — si no incluye ya el nombre del padre, se le añade
      // delante para que quede claro de qué es.
      const displayName = String(comp.name).toLowerCase().includes(parent.name.toLowerCase())
        ? comp.name
        : `${parent.name} ${comp.name}`;

      const id = `blueprint-${parent.uniqueName || parent.name}-${comp.name}`;
      if (seen.has(id)) return;
      seen.add(id);

      out.push({
        id,
        uniqueName: id,
        name: displayName,
        rawName: comp.name,
        parentName: parent.name,
        description: `Plano de ${parent.name}.`,
        category: 'Planos',
        type: 'Blueprint',
        imageName: comp.imageName,
        wikiaThumbnail: comp.wikiaThumbnail,
        tradable: comp.tradable,
        // Algunos componentes ya traen sus propios drops (misiones/jefes)
        // directamente en los datos de Warframes/Armas.
        componentDrops: Array.isArray(comp.drops) ? comp.drops : null
      });
    });
  });

  return out;
}

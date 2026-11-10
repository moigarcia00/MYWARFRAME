// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — datos de Mods
// Mismo patrón que warframeApi.js/weaponsApi.js: pide ES + EN
// en paralelo y combina ambos para traducir todo lo posible.
// ══════════════════════════════════════════════════════════
import {
  fetchLang,
  mergeTextFields,
  isEmpty,
  makeCache,
  dedupeRequest,
  imageUrl as sharedImageUrl
} from './apiCore';

const CACHE = makeCache('mywarframe_mods_cache_v9', 1000 * 60 * 60 * 12); // 12 horas

const TEXT_FIELDS = ['description'];

function mergeLevelStats(esStats, enStats) {
  const en = Array.isArray(enStats) ? enStats : [];
  const es = Array.isArray(esStats) ? esStats : [];
  return en.map((enLevel, idx) => {
    const esLevel = es[idx] || {};
    return {
      ...enLevel,
      stats:
        Array.isArray(esLevel.stats) && esLevel.stats.length && !esLevel.stats.every(isEmpty)
          ? esLevel.stats
          : enLevel.stats
    };
  });
}

function mergeItem(esItem, enItem, statsEs) {
  let merged = { ...enItem, ...esItem };
  merged = mergeTextFields(merged, esItem, enItem, TEXT_FIELDS);
  merged.levelStats = mergeLevelStats(esItem?.levelStats, enItem?.levelStats);
  merged.nameEn = enItem?.name;

  const maxStatsEs = statsEs[merged.uniqueName];
  if (Array.isArray(maxStatsEs) && maxStatsEs.length > 0) {
    if (merged.levelStats.length > 0) {
      const last = merged.levelStats.length - 1;
      merged.levelStats[last] = { ...merged.levelStats[last], stats: maxStatsEs };
    } else {
      merged.levelStats = [{ stats: maxStatsEs }];
    }
  }

  return merged;
}

// Algunas entradas de /mods no son mods equipables de verdad (algunas
// entradas internas, mods "TEST", etc). Se descartan por si acaso vienen
// sin nombre o marcadas explícitamente como no equipables. También se
// descartan:
//  - las plantillas de riven sin revelar que da la API ("Riven Mod",
//    "Arch-Gun Riven Mod", "Zaw Riven Mod"...) — no son mods de verdad,
//    son el "molde" genérico del objeto antes de revelarlo, y los rivens
//    de cada jugador ya tienen su propia sección manual (Agrietados).
//  - las entradas "Artefacto sin fusionar" / "Unfused artifact" — son
//    plantillas genéricas sin nombre real asignado todavía en los datos
//    de WFCD (mismo patrón que los rivens sin revelar), no un mod que
//    puedas tener de verdad.
function isRealMod(it) {
  if (!it?.name) return false;
  if (it.type === 'Mods' && it.equippable === false) return false;
  const isRivenLike =
    it.rarity === 'riven' || /riven/i.test(it.name) || /riven/i.test(String(it.type || ''));
  if (isRivenLike) return false;
  if (/sin fusionar/i.test(it.name) || /unfused/i.test(it.name)) return false;
  return true;
}

function mergeDatasets(esData, enData, statsEs) {
  const enByUnique = new Map(enData.map((it) => [it.uniqueName, it]));
  const seen = new Set();
  const out = [];
  esData.filter(isRealMod).forEach((esItem) => {
    const enItem = enByUnique.get(esItem.uniqueName) || esItem;
    const merged = mergeItem(esItem, enItem, statsEs);
    merged.id = merged.uniqueName || merged.name;
    // Red de seguridad: si por lo que sea la API repite un uniqueName
    // (o dos entradas sin uniqueName acaban con el mismo id por nombre),
    // solo se queda la primera — evita tarjetas duplicadas en el catálogo.
    if (seen.has(merged.id)) return;
    seen.add(merged.id);
    out.push(merged);
  });
  return dedupeByName(out);
}

// La wiki oficial de Warframe confirma que cada mod tiene un nombre
// único — si dos entradas de la API comparten el mismo "name" a rajatabla,
// es la propia API repitiéndose (restos de datos antiguos, versiones
// legacy, etc.), no dos mods distintos con el mismo nombre. Así que se
// deduplica por nombre exacto sin más: de cada grupo con el mismo
// nombre, se descartan todas las copias menos una.
//
// Para elegir CUÁL copia se queda (cuando hay más de una), se prefiere
// la que tenga más datos "reales" — imagen, descripción y estadísticas
// por nivel — ya que suele ser la versión buena/actual de los datos, y
// las copias legacy suelen venir más vacías. Si hay empate, se deja la
// primera que apareció.
function completeness(m) {
  let score = 0;
  if (m.imageName || m.wikiaThumbnail) score += 2;
  if (typeof m.description === 'string' && m.description.trim()) score += 2;
  if (Array.isArray(m.levelStats) && m.levelStats.length) score += 1;
  if (m.fusionLimit != null) score += 1;
  return score;
}

function dedupeByName(mods) {
  const byName = new Map();
  mods.forEach((m) => {
    if (!byName.has(m.name)) byName.set(m.name, []);
    byName.get(m.name).push(m);
  });

  const toDrop = new Set();
  byName.forEach((group) => {
    if (group.length < 2) return;
    let best = group[0];
    for (let i = 1; i < group.length; i++) {
      if (completeness(group[i]) > completeness(best)) best = group[i];
    }
    group.forEach((m) => {
      if (m.id !== best.id) toDrop.add(m.id);
    });
  });

  return mods.filter((m) => !toDrop.has(m.id));
}

export async function getMods({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('mods', async () => {
    const [[esData, enData], statsModule] = await Promise.all([
      Promise.all([fetchLang('mods', 'es'), fetchLang('mods', 'en')]),
      import('../data/modStatsEs.json')
    ]);

    const merged = mergeDatasets(esData, enData, statsModule.default).sort((a, b) =>
      a.name.localeCompare(b.name, 'es')
    );

    CACHE.write(merged);
    return merged;
  });
}

export function clearModsCache() {
  CACHE.clear();
}

export const imageUrl = sharedImageUrl;

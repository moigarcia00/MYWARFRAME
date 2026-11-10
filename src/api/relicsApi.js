// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — datos de Reliquias
//
// La API no tiene un endpoint dedicado a reliquias como tal: el catálogo
// (qué recompensas trae cada reliquia y si está en bóveda) viene de
// /wfinfo/filtered_items, un endpoint del complemento WFInfo que la
// propia documentación de la API marca como "puede no estar disponible"
// (responde 503 si el servicio externo no está configurado). Así que
// aquí se pide con manejo de error explícito: si falla, no se rompe la
// página — se avisa claramente y, si acaso, se siguen mostrando las
// reliquias Requiem (que son datos curados a mano, no dependen de este
// endpoint en absoluto).
// ══════════════════════════════════════════════════════════
import { http, makeCache, dedupeRequest } from './apiCore';
import { REQUIEM_RELICS } from '../data/requiemRelics';

const CACHE = makeCache('mywarframe_relics_cache_v2', 1000 * 60 * 60 * 12); // 12 horas

// Tablas de probabilidad estándar del juego (públicas, iguales para
// cualquier reliquia normal): 3 recompensas comunes, 2 poco comunes, 1
// rara. Las reliquias Requiem NO siguen esta tabla (usan su propio
// "prob" por recompensa), así que no se les aplica esto.
export const DROP_CHANCES = {
  intact: { common: 25.33, uncommon: 11, rare: 2 },
  exceptional: { common: 23.33, uncommon: 13, rare: 4 },
  flawless: { common: 20, uncommon: 17, rare: 6 },
  radiant: { common: 16.67, uncommon: 20, rare: 10 }
};

export const REFINEMENTS = ['intact', 'exceptional', 'flawless', 'radiant'];

const TIER_ORDER = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];

// Imagen genérica por era — la API/WFInfo no da una imagen por cada
// reliquia en concreto, solo hay un icono de reliquia por era (igual en
// tu reliquias.js original: todas las Axi usan el mismo PNG, etc).
const TIER_IMAGE = {
  Lith: 'https://cdn.warframestat.us/img/RelicLithD.png',
  Meso: 'https://cdn.warframestat.us/img/RelicMesoD.png',
  Neo: 'https://cdn.warframestat.us/img/RelicNeoD.png',
  Axi: 'https://cdn.warframestat.us/img/RelicAxiD.png',
  Requiem: 'https://cdn.warframestat.us/img/RelicImmortalD.png'
};

export function relicImageUrl(relic) {
  return TIER_IMAGE[relic?.era] || null;
}

function rewardsFromEntry(entry) {
  // rare1/rare2, uncommon1/uncommon2, common1/common2/common3 — se recogen
  // todos los que existan, sea cual sea la cantidad exacta que traiga.
  const rewards = [];
  Object.keys(entry).forEach((key) => {
    const match = key.match(/^(rare|uncommon|common)(\d+)$/i);
    if (match && entry[key]) {
      rewards.push({ rarity: match[1].toLowerCase(), item: entry[key] });
    }
  });
  const order = { rare: 0, uncommon: 1, common: 2 };
  rewards.sort((a, b) => order[a.rarity] - order[b.rarity]);
  return rewards;
}

function flattenRelics(relicsByEra) {
  const out = [];
  const eras = Object.keys(relicsByEra || {});
  const orderedEras = [
    ...TIER_ORDER.filter((t) => eras.includes(t)),
    ...eras.filter((t) => !TIER_ORDER.includes(t))
  ];
  orderedEras.forEach((era) => {
    const codes = relicsByEra[era] || {};
    Object.entries(codes).forEach(([code, entry]) => {
      out.push({
        id: `${era}-${code}`,
        era,
        code,
        name: `${era} ${code}`,
        vaulted: !!entry.vaulted,
        rewards: rewardsFromEntry(entry)
      });
    });
  });
  return out;
}

export async function getRelics({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('relics', async () => {
    let apiRelics = [];
    let apiError = null;
    try {
      const { data } = await http.get('/wfinfo/filtered_items');
      apiRelics = flattenRelics(data?.relics);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 503) {
        apiError = 'El servicio de reliquias (WFInfo) no está disponible ahora mismo en la API pública.';
      } else {
        apiError = status
          ? `Error ${status} al consultar la API de reliquias`
          : err instanceof Error
            ? err.message
            : 'Error desconocido';
      }
    }

    // Las Requiem son datos curados a mano — se añaden siempre, aunque
    // falle la API (no dependen de wfinfo en absoluto).
    const combined = [...apiRelics, ...REQUIEM_RELICS];

    if (combined.length === 0) {
      throw new Error(apiError || 'La API no devolvió datos de reliquias en este momento.');
    }

    CACHE.write({ relics: combined, partial: !!apiError });
    return { relics: combined, partial: !!apiError };
  });
}

export function clearRelicsCache() {
  CACHE.clear();
}

// Busca en qué reliquias sale un objeto por nombre (usado en el panel
// "Cómo conseguirlo" de Objetos, para planos que vienen de reliquias).
export function relicsContaining(relics, itemName) {
  if (!itemName) return [];
  const term = String(itemName).trim().toLowerCase();
  return relics.filter((r) => r.rewards.some((rw) => String(rw.item).trim().toLowerCase() === term));
}

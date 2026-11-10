// ══════════════════════════════════════════════════════════
// API: api.warframestat.us — Enemigos del Códice
//
// La API no tiene un endpoint dedicado de enemigos: se pide el catálogo
// general /items y se filtra por category === "Enemy". Los nombres de los
// enemigos son iguales en ES y EN, así que basta con pedir un idioma.
//
// El campo `type` de la API no coincide con los nombres de facción de la
// app (usa Rifle, Shotgun, Neutral, Orbiter...). Primero se traduce el
// `type`; si no es una facción clara, se usa el campo `faction`, que la API
// solo rellena en algunos enemigos. El resto cae en "Otros".
// ══════════════════════════════════════════════════════════
import {
  fetchLang,
  makeCache,
  dedupeRequest,
  imageUrl as sharedImageUrl
} from './apiCore';

const CACHE = makeCache('mywarframe_enemies_cache_v3', 1000 * 60 * 60 * 12); // 12 horas

const FACTION_ES = {
  grineer: 'Grineer',
  corpus: 'Corpus',
  infestation: 'Infestación',
  orokin: 'Orokin',
  sentient: 'Consciente',
  stalker: 'Stalker',
  neutral: 'Otros'
};

const ONLY_FIELDS =
  'uniqueName,name,type,category,faction,imageName,description,health,shield,armor,resistances';

function resolveFaction(item) {
  const byType = FACTION_ES[String(item.type || '').toLowerCase()];
  if (byType) return byType;
  return FACTION_ES[String(item.faction || '').toLowerCase()] || 'Otros';
}

function toEnemy(item) {
  return {
    id: `enemy:${item.name}`,
    uniqueName: item.uniqueName,
    nombre: item.name,
    faccion: resolveFaction(item),
    type: item.type || '',
    imageName: item.imageName,
    imagenUrl: sharedImageUrl(item) || '',
    description: item.description || '',
    health: item.health,
    shield: item.shield,
    armor: item.armor,
    resistances: Array.isArray(item.resistances) ? item.resistances : [],
    manual: false
  };
}

export async function getEnemies({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) return cached;
  }

  return dedupeRequest('enemies', async () => {
    const data = await fetchLang('items', 'en', { only: ONLY_FIELDS });

    // La API repite algunos enemigos (variantes con distinto uniqueName),
    // así que se deja solo la primera aparición de cada nombre.
    const seen = new Set();
    const enemies = [];

    data.forEach((item) => {
      if (String(item.category || '').toUpperCase() !== 'ENEMY') return;
      if (!item.name || seen.has(item.name)) return;
      seen.add(item.name);
      enemies.push(toEnemy(item));
    });

    CACHE.write(enemies);
    return enemies;
  });
}

export function clearEnemiesCache() {
  CACHE.clear();
}

export const imageUrl = sharedImageUrl;

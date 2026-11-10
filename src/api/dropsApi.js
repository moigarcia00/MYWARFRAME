// ══════════════════════════════════════════════════════════
// API: api.warframestat.us/drops — tabla de drops de TODO el juego
// (misión, objeto, rareza, probabilidad, rotación). Se usa para mostrar
// "cómo conseguirlo" en el panel de detalle de Objetos, en el mismo
// hueco donde Warframes muestra las habilidades.
//
// Es un array enorme (todo el juego junto), así que se pide una sola
// vez, se cachea, y se indexa por nombre de objeto en minúsculas para
// que buscar los drops de un objeto concreto sea instantáneo.
// ══════════════════════════════════════════════════════════
import { http, makeCache, dedupeRequest } from './apiCore';

const CACHE = makeCache('mywarframe_drops_cache_v1', 1000 * 60 * 60 * 12); // 12 horas

function buildIndex(list) {
  const index = new Map();
  list.forEach((d) => {
    const key = String(d.item || '').trim().toLowerCase();
    if (!key) return;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(d);
  });
  return index;
}

let cachedIndex = null;

export async function getDropsIndex({ force = false } = {}) {
  if (!force) {
    const cached = CACHE.read();
    if (cached) {
      if (!cachedIndex) cachedIndex = buildIndex(cached);
      return cachedIndex;
    }
  }

  return dedupeRequest('drops', async () => {
    let data;
    try {
      const res = await http.get('/drops');
      data = res.data;
    } catch (err) {
      const status = err?.response?.status;
      throw new Error(
        status ? `Error ${status} al consultar la tabla de drops` : 'Error al consultar la tabla de drops',
        { cause: err }
      );
    }
    const list = Array.isArray(data) ? data : [];

    CACHE.write(list);
    cachedIndex = buildIndex(list);
    return cachedIndex;
  });
}

// Busca los drops de un objeto por nombre exacto y, si no hay nada,
// prueba también con un nombre "en bruto" alternativo (por ejemplo el
// nombre del componente sin el prefijo del warframe/arma).
export function dropsFor(index, ...names) {
  for (const name of names) {
    if (!name) continue;
    const found = index.get(String(name).trim().toLowerCase());
    if (found && found.length) return found;
  }
  return [];
}

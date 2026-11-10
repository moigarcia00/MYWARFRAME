// ══════════════════════════════════════════════════════════
// Utilidades compartidas por las distintas fuentes de datos
// (warframes, armas, ...) que consumen api.warframestat.us
// ══════════════════════════════════════════════════════════
import axios from 'axios';

export const BASE_URL = 'https://api.warframestat.us';

// Instancia de axios compartida por todas las llamadas a la API.
export const http = axios.create({ baseURL: BASE_URL });

export async function fetchLang(endpoint, lang, extraParams = {}) {
  try {
    const { data } = await http.get(`/${endpoint}`, {
      params: { language: lang, ...extraParams }
    });
    return data;
  } catch (err) {
    const status = err?.response?.status;
    throw new Error(
      status ? `Error ${status} al consultar la API (${lang})` : `Error al consultar la API (${lang})`,
      { cause: err }
    );
  }
}

export function isEmpty(v) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

// Combina un item en español con su equivalente en inglés: para cada campo
// de `textFields`, usa el valor en español si existe, y si no cae al inglés
// (marcando `${campo}_fallback = true` por si algún día quieres resaltarlo).
export function mergeTextFields(merged, esItem, enItem, textFields) {
  textFields.forEach((field) => {
    if (isEmpty(esItem?.[field]) && !isEmpty(enItem?.[field])) {
      merged[field] = enItem[field];
      merged[`${field}_fallback`] = true;
    }
  });
  return merged;
}

// URL de imagen a partir de los campos que devuelve la API. Se prefiere el
// CDN de WFCD y Fandom queda como último recurso.
export function imageUrl(item) {
  if (item?.imageName) return `https://cdn.warframestat.us/img/${item.imageName}`;
  if (item?.wikiaThumbnail) return item.wikiaThumbnail;
  return null;
}

// Al subir la versión de una caché (por ejemplo ..._v2 → ..._v3), borra las
// versiones anteriores de esa misma caché para que no sigan ocupando espacio.
function clearOldVersions(cacheKey) {
  const match = /^(.*_cache_v)\d+$/.exec(cacheKey);
  if (!match) return;
  const prefix = match[1];
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key === cacheKey) return;
      const other = /^(.*_cache_v)\d+$/.exec(key);
      if (other && other[1] === prefix) localStorage.removeItem(key);
    });
  } catch {
    /* localStorage no disponible: no es crítico */
  }
}

export function makeCache(cacheKey, ttlMs) {
  clearOldVersions(cacheKey);

  // Copia en memoria para no tener que leer y parsear localStorage cada vez
  // que se entra a una pestaña. Se descarta al caducar o al limpiar la caché.
  let memory = null;

  function read() {
    if (memory && Date.now() - memory.timestamp <= ttlMs) return memory.data;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) {
        memory = null;
        return null;
      }
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > ttlMs) {
        memory = null;
        return null;
      }
      memory = parsed;
      return parsed.data;
    } catch {
      memory = null;
      return null;
    }
  }

  function write(data) {
    memory = { timestamp: Date.now(), data };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(memory));
    } catch {
      // localStorage lleno o no disponible: no es crítico, seguimos sin cache
    }
  }

  function clear() {
    memory = null;
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      /* noop */
    }
  }

  return { read, write, clear };
}

// Evita que dos componentes pidan lo mismo a la vez (por ejemplo al montar
// dos pantallas juntas o con React.StrictMode en desarrollo).
const inFlight = new Map();

export function dedupeRequest(key, fn) {
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = Promise.resolve()
    .then(fn)
    .finally(() => {
      if (inFlight.get(key) === promise) inFlight.delete(key);
    });
  inFlight.set(key, promise);
  return promise;
}

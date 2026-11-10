import { useCallback, useState } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';

// Estado de escaneado de los enemigos que vienen de la API. No se guarda
// la lista entera (se vuelve a pedir a la API), solo los ids marcados.
const STORAGE_KEY = STORAGE_KEYS.faccionEnemigosEscaneados;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function save(scanned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...scanned]));
  } catch {
    /* localStorage lleno o no disponible: no es crítico */
  }
}

export function useScannedEnemies() {
  const [scanned, setScanned] = useState(load);

  const isScanned = useCallback((id) => scanned.has(id), [scanned]);

  const toggleScanned = useCallback((id) => {
    if (!id) return;
    setScanned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      save(next);
      return next;
    });
  }, []);

  return { isScanned, toggleScanned };
}

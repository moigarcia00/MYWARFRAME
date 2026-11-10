import { useCallback, useState } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';

// Registro de qué warframes se han enviado al Helminto — exclusivo de
// la pestaña Warframes, guardado aparte de la colección normal
// (obtenidos/maestría/skin/helmet) para no tocar la fábrica compartida
// con Armas y Compañeros.
const STORAGE_KEY = STORAGE_KEYS.warframeHelminto;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage lleno o no disponible: no es crítico */
  }
}

export function useHelminthLog() {
  const [helmintoIds, setHelmintoIds] = useState(load);

  const isHelminto = useCallback((id) => helmintoIds.includes(id), [helmintoIds]);

  const toggleHelminto = useCallback((id) => {
    if (!id) return;
    setHelmintoIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save(next);
      return next;
    });
  }, []);

  const pruneOrphans = useCallback((validIds) => {
    const valid = new Set(validIds);
    setHelmintoIds((prev) => {
      const next = prev.filter((id) => valid.has(id));
      if (next.length !== prev.length) save(next);
      return next;
    });
  }, []);

  return { helmintoIds, isHelminto, toggleHelminto, pruneOrphans };
}

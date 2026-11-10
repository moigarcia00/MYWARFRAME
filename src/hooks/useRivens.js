import { useCallback, useState } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';

// La API pública de Warframe NO tiene un catálogo de rivens: cada riven se
// genera al azar por jugador (nombre en clave, arma, hasta 4 estadísticas
// con sus propios valores). El endpoint /rivens que sí existe da precios y
// disposición de mercado, no rivens concretos de nadie. Así que esta es una
// sección 100% manual: el usuario añade los suyos y se guardan en
// localStorage — no depende de la API en absoluto.
const STORAGE_KEY = STORAGE_KEYS.rivenAgrietados;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* localStorage lleno o no disponible: no es crítico */
  }
}

function newId() {
  return `riven_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useRivens() {
  const [rivens, setRivens] = useState(load);

  const addRiven = useCallback((data) => {
    setRivens((prev) => {
      const next = [...prev, { ...data, id: newId() }];
      save(next);
      return next;
    });
  }, []);

  const updateRiven = useCallback((id, data) => {
    setRivens((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...data, id } : r));
      save(next);
      return next;
    });
  }, []);

  const deleteRiven = useCallback((id) => {
    setRivens((prev) => {
      const next = prev.filter((r) => r.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { rivens, addRiven, updateRiven, deleteRiven };
}

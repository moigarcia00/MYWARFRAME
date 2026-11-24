import { useCallback, useState } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';

// Registro manual de enemigos escaneados — la API no tiene un catálogo
// de enemigos individuales del Códice, así que esto es 100% tuyo, igual
// que los Agrietados. Se guarda en localStorage.
const STORAGE_KEY = STORAGE_KEYS.faccionEnemigos;

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
  return `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useEnemyLog() {
  const [enemies, setEnemies] = useState(load);

  const addEnemy = useCallback((data) => {
    setEnemies((prev) => {
      const next = [...prev, { ...data, id: newId() }];
      save(next);
      return next;
    });
  }, []);

  const updateEnemy = useCallback((id, data) => {
    setEnemies((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...data, id } : e));
      save(next);
      return next;
    });
  }, []);

  const deleteEnemy = useCallback((id) => {
    setEnemies((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const toggleEscaneado = useCallback((id) => {
    setEnemies((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, escaneado: !e.escaneado } : e));
      save(next);
      return next;
    });
  }, []);

  return { enemies, addEnemy, updateEnemy, deleteEnemy, toggleEscaneado };
}

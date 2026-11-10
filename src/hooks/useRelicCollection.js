import { useCallback, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';

const KEY = STORAGE_KEYS.reliquiaCantidades; // { id: { intact, exceptional, flawless, radiant } }
const MAX = 999;
const EMPTY = { intact: 0, exceptional: 0, flawless: 0, radiant: 0 };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* localStorage lleno o no disponible: no es crítico */
  }
}

export function useRelicCollection() {
  const [cantidades, setCantidades] = useState(load);

  const getCantidades = useCallback((id) => ({ ...EMPTY, ...(cantidades[id] || {}) }), [cantidades]);

  const totalDe = useCallback(
    (id) => {
      const c = cantidades[id];
      if (!c) return 0;
      return (c.intact || 0) + (c.exceptional || 0) + (c.flawless || 0) + (c.radiant || 0);
    },
    [cantidades]
  );

  const isObtenido = useCallback((id) => totalDe(id) > 0, [totalDe]);

  const setCantidad = useCallback((id, calidad, n) => {
    if (!id) return;
    setCantidades((prev) => {
      const clamped = Math.max(0, Math.min(MAX, Math.round(n)));
      const prevForId = { ...EMPTY, ...(prev[id] || {}) };
      const nextForId = { ...prevForId, [calidad]: clamped };
      const next = { ...prev };
      const total = Object.values(nextForId).reduce((s, v) => s + v, 0);
      if (total === 0) delete next[id];
      else next[id] = nextForId;
      save(next);
      return next;
    });
  }, []);

  const pruneOrphans = useCallback((validIds) => {
    const valid = new Set(validIds);
    setCantidades((prev) => {
      const entries = Object.entries(prev).filter(([id]) => valid.has(id));
      if (entries.length === Object.keys(prev).length) return prev;
      const next = Object.fromEntries(entries);
      save(next);
      return next;
    });
  }, []);

  const totalObtenidas = useMemo(() => Object.keys(cantidades).length, [cantidades]);
  const totalCopias = useMemo(
    () =>
      Object.values(cantidades).reduce(
        (sum, c) => sum + (c.intact || 0) + (c.exceptional || 0) + (c.flawless || 0) + (c.radiant || 0),
        0
      ),
    [cantidades]
  );

  return {
    cantidades,
    getCantidades,
    totalDe,
    isObtenido,
    setCantidad,
    pruneOrphans,
    totalObtenidas,
    totalCopias
  };
}

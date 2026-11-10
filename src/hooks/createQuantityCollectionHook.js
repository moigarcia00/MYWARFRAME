import { useCallback, useMemo, useState } from 'react';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage lleno o no disponible: no es crítico */
  }
}

const MAX_CANTIDAD = 999;

/**
 * Fábrica de hooks de colección basada en CANTIDAD en vez de un simple
 * obtenido/no obtenido — pensada para mods, donde es normal tener varias
 * copias del mismo. "Obtenido" pasa a significar "cantidad > 0".
 */
export function createQuantityCollectionHook(keys) {
  const { CANTIDADES } = keys;

  function loadCantidades() {
    const raw = load(CANTIDADES, {});
    if (typeof raw !== 'object' || raw === null) return {};
    // Autolimpieza: descarta entradas con clave vacía o valor no numérico.
    const clean = {};
    let changed = false;
    Object.entries(raw).forEach(([id, val]) => {
      const n = Number(val);
      if (id && id.trim() && Number.isFinite(n) && n > 0) {
        clean[id] = Math.min(MAX_CANTIDAD, Math.round(n));
      } else {
        changed = true;
      }
    });
    if (changed || Object.keys(clean).length !== Object.keys(raw).length) save(CANTIDADES, clean);
    return clean;
  }

  return function useQuantityCollectionInstance() {
    const [cantidades, setCantidades] = useState(loadCantidades);

    const getCantidad = useCallback((id) => cantidades[id] || 0, [cantidades]);
    const isObtenido = useCallback((id) => (cantidades[id] || 0) > 0, [cantidades]);

    const setCantidad = useCallback((id, n) => {
      if (!id) return;
      setCantidades((prev) => {
        const clamped = Math.max(0, Math.min(MAX_CANTIDAD, Math.round(n)));
        const next = { ...prev };
        if (clamped === 0) delete next[id];
        else next[id] = clamped;
        save(CANTIDADES, next);
        return next;
      });
    }, []);

    const incrementar = useCallback(
      (id) => setCantidad(id, (cantidades[id] || 0) + 1),
      [cantidades, setCantidad]
    );
    const decrementar = useCallback(
      (id) => setCantidad(id, (cantidades[id] || 0) - 1),
      [cantidades, setCantidad]
    );

    const pruneOrphans = useCallback((validIds) => {
      const valid = new Set(validIds);
      setCantidades((prev) => {
        const entries = Object.entries(prev).filter(([id]) => valid.has(id));
        if (entries.length === Object.keys(prev).length) return prev;
        const next = Object.fromEntries(entries);
        save(CANTIDADES, next);
        return next;
      });
    }, []);

    const totalObtenidos = useMemo(() => Object.keys(cantidades).length, [cantidades]);
    const totalCopias = useMemo(
      () => Object.values(cantidades).reduce((sum, n) => sum + n, 0),
      [cantidades]
    );

    return {
      cantidades,
      getCantidad,
      isObtenido,
      setCantidad,
      incrementar,
      decrementar,
      pruneOrphans,
      totalObtenidos,
      totalCopias
    };
  };
}

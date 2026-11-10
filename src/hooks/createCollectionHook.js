import { useCallback, useState } from 'react';

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

/**
 * Fábrica de hooks de colección (obtenidos / maestría / skin activa /
 * helmet activo / skins-helmets obtenidos), parametrizable por un juego
 * de claves de localStorage. Así Warframes y Armas comparten exactamente
 * la misma lógica sin pisarse los datos guardados entre sí.
 */
export function createCollectionHook(keys) {
  const { OBTENIDOS, MAESTRIAS, SKINS, HELMETS, SKINS_OBTENIDAS, HELMETS_OBTENIDOS } = keys;

  // Autolimpieza: versiones anteriores podían guardar ids vacíos/null en la
  // lista de obtenidos (por eso el contador podía marcar "1" sin que
  // ninguna tarjeta apareciera al filtrar). Al cargar, se descartan esos
  // valores inválidos y se reescribe la clave ya limpia.
  function loadObtenidos() {
    const raw = load(OBTENIDOS, []);
    const clean = Array.isArray(raw) ? raw.filter((id) => typeof id === 'string' && id.trim()) : [];
    if (clean.length !== raw.length) save(OBTENIDOS, clean);
    return clean;
  }

  return function useCollectionInstance() {
    const [obtenidos, setObtenidos] = useState(loadObtenidos);
    const [maestrias, setMaestrias] = useState(() => load(MAESTRIAS, {}));
    const [skinActiva, setSkinActiva] = useState(() => load(SKINS, {}));
    const [helmetActivo, setHelmetActivo] = useState(() => load(HELMETS, {}));
    const [skinsObtenidas, setSkinsObtenidas] = useState(() => load(SKINS_OBTENIDAS, {}));
    const [helmetsObtenidos, setHelmetsObtenidos] = useState(() => load(HELMETS_OBTENIDOS, {}));

    const isObtenido = useCallback((id) => obtenidos.includes(id), [obtenidos]);

    const toggleObtenido = useCallback((id) => {
      if (!id) return;
      setObtenidos((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        save(OBTENIDOS, next);
        return next;
      });
    }, []);

    const setMaestria = useCallback((id, rango, max = 30) => {
      setMaestrias((prev) => {
        const clamped = Math.max(0, Math.min(max, rango));
        const next = { ...prev, [id]: clamped };
        save(MAESTRIAS, next);
        return next;
      });
    }, []);

    const setSkin = useCallback((id, nombre) => {
      setSkinActiva((prev) => {
        const next = { ...prev, [id]: nombre };
        save(SKINS, next);
        return next;
      });
    }, []);

    const setHelmet = useCallback((id, nombre) => {
      setHelmetActivo((prev) => {
        const next = { ...prev, [id]: nombre };
        save(HELMETS, next);
        return next;
      });
    }, []);

    const isSkinObtenida = useCallback(
      (id, nombre) => !!(skinsObtenidas[id] && skinsObtenidas[id][nombre]),
      [skinsObtenidas]
    );

    const toggleSkinObtenida = useCallback((id, nombre) => {
      setSkinsObtenidas((prev) => {
        const prevForId = prev[id] || {};
        const next = {
          ...prev,
          [id]: { ...prevForId, [nombre]: !prevForId[nombre] }
        };
        save(SKINS_OBTENIDAS, next);
        return next;
      });
    }, []);

    const isHelmetObtenido = useCallback(
      (id, nombre) => !!(helmetsObtenidos[id] && helmetsObtenidos[id][nombre]),
      [helmetsObtenidos]
    );

    const toggleHelmetObtenido = useCallback((id, nombre) => {
      setHelmetsObtenidos((prev) => {
        const prevForId = prev[id] || {};
        const next = {
          ...prev,
          [id]: { ...prevForId, [nombre]: !prevForId[nombre] }
        };
        save(HELMETS_OBTENIDOS, next);
        return next;
      });
    }, []);

    // Elimina cualquier id "huérfano": uno guardado en su día (obtenido,
    // con maestría, con skin activa...) que ya no corresponde a nada del
    // catálogo actual (p.ej. si la API retira o renombra un item).
    const pruneOrphans = useCallback((validIds) => {
      const valid = new Set(validIds);

      setObtenidos((prev) => {
        const next = prev.filter((id) => valid.has(id));
        if (next.length !== prev.length) save(OBTENIDOS, next);
        return next;
      });

      const pruneMap = (setter, key) => {
        setter((prev) => {
          const entries = Object.entries(prev).filter(([id]) => valid.has(id));
          if (entries.length === Object.keys(prev).length) return prev;
          const next = Object.fromEntries(entries);
          save(key, next);
          return next;
        });
      };

      pruneMap(setMaestrias, MAESTRIAS);
      pruneMap(setSkinActiva, SKINS);
      pruneMap(setHelmetActivo, HELMETS);
      pruneMap(setSkinsObtenidas, SKINS_OBTENIDAS);
      pruneMap(setHelmetsObtenidos, HELMETS_OBTENIDOS);
    }, []);

    return {
      obtenidos,
      isObtenido,
      toggleObtenido,
      maestrias,
      setMaestria,
      skinActiva,
      setSkin,
      helmetActivo,
      setHelmet,
      isSkinObtenida,
      toggleSkinObtenida,
      isHelmetObtenido,
      toggleHelmetObtenido,
      pruneOrphans,
      totalObtenidos: obtenidos.length
    };
  };
}

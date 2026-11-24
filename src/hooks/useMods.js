import { useCallback, useEffect, useState } from 'react';
import { getMods } from '../api/modsApi';

export function useMods() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMods({ force });
      setMods(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo conectar con la API de Warframe.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { mods, loading, error, reload: () => load(true) };
}

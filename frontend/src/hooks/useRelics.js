import { useCallback, useEffect, useState } from 'react';
import { getRelics } from '../api/relicsApi';

export function useRelics(enabled = true) {
  const [relics, setRelics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partial, setPartial] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRelics({ force });
      setRelics(result.relics);
      setPartial(result.partial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con la API de Warframe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
  }, [enabled, load]);

  return { relics, loading, error, partial, reload: () => load(true) };
}

import { useCallback, useEffect, useState } from 'react';
import { getWeapons } from '../api/weaponsApi';

export function useWeapons() {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeapons({ force });
      setWeapons(data);
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

  return { weapons, loading, error, reload: () => load(true) };
}

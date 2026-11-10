import { useCallback, useEffect, useState } from 'react';
import { getCompanions } from '../api/companionsApi';

export function useCompanions() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanions({ force });
      setCompanions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con la API de Warframe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { companions, loading, error, reload: () => load(true) };
}

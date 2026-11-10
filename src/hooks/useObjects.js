import { useCallback, useEffect, useState } from 'react';
import { getObjects } from '../api/objectsApi';

export function useObjects() {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getObjects({ force });
      setObjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con la API de Warframe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { objects, loading, error, reload: () => load(true) };
}

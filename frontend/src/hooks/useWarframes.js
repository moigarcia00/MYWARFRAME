import { useCallback, useEffect, useState } from 'react';
import { getWarframes } from '../api/warframeApi';

export function useWarframes() {
  const [warframes, setWarframes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWarframes({ force });
      setWarframes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con la API de Warframe.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { warframes, loading, error, reload: () => load(true) };
}

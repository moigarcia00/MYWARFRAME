import { useEffect, useState } from 'react';
import { getDropsIndex } from '../api/dropsApi';

export function useDrops(enabled = true) {
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    getDropsIndex()
      .then((idx) => {
        if (!cancelled) setIndex(idx);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { index, error };
}

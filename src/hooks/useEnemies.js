import { useEffect, useState } from 'react';
import { getEnemies } from '../api/enemiesApi';

export function useEnemies() {
  const [enemies, setEnemies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getEnemies()
      .then((data) => {
        if (!cancelled) {
          setEnemies(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { enemies, loading, error };
}

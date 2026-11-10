import { useEffect, useState } from 'react';
import { getFactions } from '../api/factionsApi';

export function useFactions() {
  const [factions, setFactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFactions().then((data) => {
      if (!cancelled) {
        setFactions(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { factions, loading };
}

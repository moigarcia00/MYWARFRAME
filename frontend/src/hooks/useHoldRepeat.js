import { useCallback, useRef } from 'react';

// Permite mantener pulsado un botón para que su acción se repita sola,
// en vez de tener que hacer clic muchas veces (pensado para las barras
// de maestría y los contadores de cantidad, que pueden llegar a 30-40 o
// más). Empieza tras un pequeño retraso y luego repite a intervalo fijo.
// Funciona con ratón y con touch, y para en cuanto se suelta/sale el
// puntero o se desmonta el componente.
export function useHoldRepeat(callback, { delay = 400, interval = 90 } = {}) {
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const start = useCallback(
    (e) => {
      // Evita que el evento touch dispare también un click sintético
      // (que duplicaría el primer paso).
      if (e?.cancelable) e.preventDefault();
      callback();
      clear();
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(callback, interval);
      }, delay);
    },
    [callback, clear, delay, interval]
  );

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    // event.detail es 0 en clics disparados por teclado (Enter/Espacio) o
    // programáticamente — así el botón sigue siendo accesible por teclado
    // sin duplicar el paso en un clic de ratón normal (que ya se dispara
    // en onMouseDown).
    onClick: (e) => {
      if (e.detail === 0) callback();
    }
  };
}

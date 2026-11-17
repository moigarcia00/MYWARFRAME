import { useCallback, useRef } from 'react';

// Permite mantener pulsado un botón para que su acción se repita sola,
// en vez de tener que hacer clic muchas veces (pensado para las barras
// de maestría y los contadores de cantidad, que pueden llegar a 30-40 o
// más). Empieza tras un pequeño retraso y luego repite a intervalo fijo.
// Funciona con ratón y con touch, y para en cuanto se suelta/sale el
// puntero o se desmonta el componente.
//
// Se usan Pointer Events (onPointerDown) en lugar de mouse + touch: en
// móvil, un toque dispara touchstart Y DESPUÉS un mousedown "simulado",
// así que escuchar ambos sumaba dos veces por pulsación. Los Pointer
// Events unifican ratón, dedo y lápiz en un único evento.
export function useHoldRepeat(callback, { delay = 400, interval = 90 } = {}) {
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastPointerRef = useRef(0);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const start = useCallback(
    (e) => {
      if (e.button > 0) return; // ignora botón derecho/central del ratón
      if (e?.cancelable) e.preventDefault();
      lastPointerRef.current = Date.now();
      callback();
      clear();
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(callback, interval);
      }, delay);
    },
    [callback, clear, delay, interval]
  );

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    // El click sigue existiendo (y también lo genera el teclado con
    // detail === 0). Se ignora cualquier click que venga poco después de
    // un pointerdown para no duplicar el paso; el teclado no pasa por
    // pointerdown, así que sigue funcionando.
    onClick: (e) => {
      if (e.detail === 0 && Date.now() - lastPointerRef.current > 500) callback();
    }
  };
}

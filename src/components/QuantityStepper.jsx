import { useCallback, useRef } from 'react';
import { useHoldRepeat } from '../hooks/useHoldRepeat';

export default function QuantityStepper({ cantidad = 0, onChange }) {
  const cantidadRef = useRef(cantidad);
  cantidadRef.current = cantidad;

  const increment = useCallback(() => {
    onChange(cantidadRef.current + 1);
  }, [onChange]);

  const decrement = useCallback(() => {
    onChange(Math.max(0, cantidadRef.current - 1));
  }, [onChange]);

  const incHold = useHoldRepeat(increment);
  const decHold = useHoldRepeat(decrement);

  function stop(e) {
    e.stopPropagation();
  }

  function handleInput(e) {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(Math.max(0, Math.round(n)));
  }

  return (
    <div className="qty-wrap" onClick={stop}>
      <span className="qty-label">Tienes</span>
      <div className="qty-row">
        <button type="button" className="qty-btn" title="Quitar una (mantén pulsado para ir más rápido)" {...decHold}>
          −
        </button>
        <input
          type="number"
          className="qty-input"
          min="0"
          value={cantidad}
          onChange={handleInput}
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="qty-btn" title="Añadir una (mantén pulsado para ir más rápido)" {...incHold}>
          +
        </button>
      </div>
    </div>
  );
}

import { useCallback, useRef } from 'react';
import { useHoldRepeat } from '../hooks/useHoldRepeat';

export default function MasteryBar({ rango = 0, max = 30, onChange }) {
  const pct = (rango / max) * 100;

  // Ref con el valor más reciente, para que mantener pulsado siga
  // incrementando/decrementando desde el valor real aunque el intervalo
  // ya se haya creado con un closure más antiguo.
  const rangoRef = useRef(rango);
  rangoRef.current = rango;

  const increment = useCallback(() => {
    onChange(Math.min(max, rangoRef.current + 1));
  }, [onChange, max]);

  const decrement = useCallback(() => {
    onChange(Math.max(0, rangoRef.current - 1));
  }, [onChange]);

  const incHold = useHoldRepeat(increment);
  const decHold = useHoldRepeat(decrement);

  function stop(e) {
    e.stopPropagation();
  }

  return (
    <div className="maestria-wrap" onClick={stop}>
      <div className="maestria-label">
        <span>Maestría</span>
        <span className="rango-val">{rango === max ? `${max} ★` : rango}</span>
      </div>
      <div className="maestria-bar-row">
        <button type="button" className="maestria-btn" title="Bajar rango (mantén pulsado para ir más rápido)" {...decHold}>
          −
        </button>
        <div className="maestria-track" style={{ '--mastery-ticks': max }}>
          <div className="maestria-fill" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="maestria-btn" title="Subir rango (mantén pulsado para ir más rápido)" {...incHold}>
          +
        </button>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { DROP_CHANCES, REFINEMENTS, relicImageUrl } from '../api/relicsApi';
import { REFINEMENT_ES, DROP_RARITY_ES } from '../data/translations';
import { formatGameText } from '../utils/gameText';
import SpinCardOverlay from './SpinCardOverlay';
import SmartImage from './SmartImage';
import { useHoldRepeat } from '../hooks/useHoldRepeat';

const TIER_CLASS = {
  Lith: 'tier-lith',
  Meso: 'tier-meso',
  Neo: 'tier-neo',
  Axi: 'tier-axi',
  Requiem: 'tier-requiem'
};

function RelicQtyCell({ refinement, value, onChange }) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const increment = useCallback(() => onChange(valueRef.current + 1), [onChange]);
  const decrement = useCallback(() => onChange(Math.max(0, valueRef.current - 1)), [onChange]);
  const incHold = useHoldRepeat(increment);
  const decHold = useHoldRepeat(decrement);

  return (
    <div className="relic-qty-cell">
      <span className="relic-qty-label">{REFINEMENT_ES[refinement]}</span>
      <div className="relic-qty-row">
        <button type="button" className="qty-btn" title="Mantén pulsado para ir más rápido" {...decHold}>
          −
        </button>
        <input
          type="number"
          className="qty-input"
          min="0"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="qty-btn" title="Mantén pulsado para ir más rápido" {...incHold}>
          +
        </button>
      </div>
    </div>
  );
}

export default function RelicModal({ relic, cantidades, onCantidadChange, onClose }) {
  const [showSpin, setShowSpin] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (showSpin) setShowSpin(false);
        else onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showSpin]);

  useEffect(() => {
    setShowSpin(false);
  }, [relic]);

  if (!relic) return null;
  const tierClass = TIER_CLASS[relic.era] || '';
  const img = relicImageUrl(relic);

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="modal-body">
          <div className="modal-image-col">
            <div className={`modal-card-frame relic-modal-frame ${tierClass}`}>
              <SmartImage
                src={img}
                alt={relic.name}
                className="relic-img relic-img-lg"
                placeholder="◆"
                placeholderClassName="relic-icon relic-icon-lg"
              />
              <div className="modal-card-name">{relic.name}</div>
            </div>

            <button type="button" className="btn-flip3d" onClick={() => setShowSpin(true)}>
              ↻ Ver carta giratoria
            </button>

            {!relic.special && (
              <div className="relic-qty-grid">
                {REFINEMENTS.map((ref) => (
                  <RelicQtyCell
                    key={ref}
                    refinement={ref}
                    value={cantidades[ref]}
                    onChange={(n) => onCantidadChange(relic.id, ref, n)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="modal-info-col">
            <div className="modal-tags">
              <span className="tag">{relic.era}</span>
              {relic.special ? (
                <span className="tag tag-muted">⚔ Sicario Kuva / Hermana de Parvos</span>
              ) : relic.vaulted ? (
                <span className="tag tag-vaulted">🔒 En bóveda</span>
              ) : (
                <span className="tag tag-muted">Disponible en misiones</span>
              )}
            </div>

            {relic.rewards.length > 0 ? (
              <div className="info-panel">
                <div className="info-panel-title">Recompensas</div>
                {relic.special ? (
                  <table className="relic-rewards-table">
                    <thead>
                      <tr>
                        <th>Objeto</th>
                        <th>Probabilidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relic.rewards.map((r, i) => (
                        <tr key={i}>
                          <td>{formatGameText(r.item)}</td>
                          <td>{r.prob}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="relic-rewards-table">
                    <thead>
                      <tr>
                        <th>Objeto</th>
                        <th>I</th>
                        <th>E</th>
                        <th>Im</th>
                        <th>R</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relic.rewards.map((r, i) => (
                        <tr key={i} className={`rarity-row-${r.rarity}`}>
                          <td>
                            <span className="reward-rarity-dot" title={DROP_RARITY_ES[r.rarity]} />
                            {formatGameText(r.item)}
                          </td>
                          {REFINEMENTS.map((ref) => (
                            <td key={ref}>{DROP_CHANCES[ref][r.rarity]}%</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="info-panel">
                <div className="info-panel-title">Recompensas</div>
                <p className="info-panel-desc">
                  La API no trajo la lista de recompensas para esta reliquia en concreto.
                </p>
              </div>
            )}

            {relic.special ? (
              <div className="info-panel passive-panel">
                <div className="info-panel-title">Sobre las reliquias Requiem</div>
                <p className="info-panel-desc">
                  Se consiguen matando al Sicario Kuva/Hermana de Parvos que las porta, no en
                  misiones con fisura del Vacío normales, y no siguen la tabla estándar de
                  común/poco común/rara — cada recompensa aquí tiene su propia probabilidad. Datos
                  añadidos a mano, no vienen de la API.
                </p>
              </div>
            ) : (
              <div className="info-panel passive-panel">
                <div className="info-panel-title">Probabilidades por calidad</div>
                <p className="info-panel-desc">
                  3 comunes, 2 poco comunes y 1 rara por reliquia — las probabilidades por calidad
                  de refinado son las mismas para cualquier reliquia del juego (no dependen del
                  contenido concreto).
                </p>
              </div>
            )}
          </div>
        </div>

        {showSpin && (
          <SpinCardOverlay img={img} name={relic.name} isPrime={false} onClose={() => setShowSpin(false)} />
        )}
      </div>
    </div>
  );
}

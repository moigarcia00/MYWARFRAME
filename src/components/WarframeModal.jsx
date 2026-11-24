import { useEffect, useState } from 'react';
import { imageUrl } from '../api/warframeApi';
import { statLabel, translatePolarities, translateFaction, maxMasteryFor } from '../data/translations';
import { formatGameText } from '../utils/gameText';
import SpinCardOverlay from './SpinCardOverlay';

export default function WarframeModal({ detail, maestria = 0, onClose }) {
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

  // Al abrir un warframe distinto, la carta giratoria empieza cerrada.
  useEffect(() => {
    setShowSpin(false);
  }, [detail]);

  if (!detail) return null;
  const { item, img: skinImg, skinNombre, skinDesc, helmetNombre } = detail;

  const isPrime = /prime/i.test(item.name);
  const img = skinImg || imageUrl(item);
  const esOriginal = !skinNombre || skinNombre === 'Original';
  const polarities = translatePolarities(item.polarities);
  const faction = translateFaction(item.faction);
  const cardName = esOriginal ? item.name : `${item.name} — ${skinNombre}`;
  const maxMastery = maxMasteryFor(item);

  const stats = [
    ['health', item.health],
    ['shield', item.shield],
    ['armor', item.armor],
    [item.power != null ? 'power' : 'energy', item.power ?? item.energy],
    ['sprintSpeed', item.sprintSpeed]
  ].filter(([, val]) => val !== undefined && val !== null);

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className={`modal-wrap ${isPrime ? 'prime' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="modal-body">
          <div className="modal-image-col">
            <div className={`modal-card-frame ${isPrime ? 'prime' : ''}`}>
              {img ? (
                <img src={img} alt={item.name} className="modal-img" />
              ) : (
                <div className="modal-img-ph">◯</div>
              )}
              <div className="modal-card-name">{cardName}</div>
            </div>

            <button type="button" className="btn-flip3d" onClick={() => setShowSpin(true)}>
              ↻ Ver carta giratoria
            </button>

            {polarities.length > 0 && (
              <div className="polarity-row">
                {polarities.map((p, i) => (
                  <span className="polarity-chip" key={i} title={p.label}>
                    {p.symbol} {p.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-info-col">
            <div className="modal-tags">
              {faction && <span className="tag">{faction}</span>}
              {item.introduced?.name && <span className="tag tag-muted">{item.introduced.name}</span>}
              {item.vaulted && <span className="tag tag-vaulted">Bóveda</span>}
              <span className="tag tag-muted">
                Aspecto: {esOriginal ? 'Original' : skinNombre}
              </span>
              {helmetNombre && helmetNombre !== 'Original' && (
                <span className="tag tag-muted">Helmet: {helmetNombre}</span>
              )}
            </div>

            <div className="info-panel">
              <div className="info-panel-title">Descripción</div>
              <p className="info-panel-desc">
                {(!esOriginal && formatGameText(skinDesc)) ||
                  formatGameText(item.description) ||
                  'Descripción no disponible.'}
              </p>
            </div>

            {stats.length > 0 && (
              <div className="stat-grid">
                {stats.map(([key, val]) => (
                  <div className="stat-cell" key={key}>
                    <span className="stat-label">{statLabel(key)}</span>
                    <span className="stat-value">{val}</span>
                  </div>
                ))}
                <div className="stat-cell stat-cell-maestria">
                  <span className="stat-label">Tu maestría</span>
                  <span className="stat-value">
                    {maestria === maxMastery ? `${maxMastery} ★` : maestria}
                  </span>
                </div>
              </div>
            )}

            {item.passiveDescription && (
              <div className="info-panel passive-panel">
                <div className="info-panel-title">Pasiva</div>
                <p className="info-panel-desc">{formatGameText(item.passiveDescription)}</p>
              </div>
            )}

            {Array.isArray(item.abilities) && item.abilities.length > 0 && (
              <div className="abilities-list">
                <div className="info-panel-title">Habilidades</div>
                {item.abilities.map((ab, i) => (
                  <div className="ability-row" key={i}>
                    <span className="ability-number">{i + 1}</span>
                    <div>
                      <div className="ability-name">{formatGameText(ab.name)}</div>
                      <div className="ability-desc">{formatGameText(ab.description)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showSpin && (
          <SpinCardOverlay img={img} name={cardName} isPrime={isPrime} onClose={() => setShowSpin(false)} />
        )}
      </div>
    </div>
  );
}

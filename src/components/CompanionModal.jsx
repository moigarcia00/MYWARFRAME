import { useEffect, useState } from 'react';
import { imageUrl } from '../api/companionsApi';
import { statLabel } from '../data/translations';
import { formatGameText } from '../utils/gameText';
import SpinCardOverlay from './SpinCardOverlay';

export default function CompanionModal({ detail, maestria = 0, onClose }) {
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
  }, [detail]);

  if (!detail) return null;
  const { item } = detail;
  const img = imageUrl(item);

  const stats = [
    ['health', item.health],
    ['shield', item.shield],
    ['armor', item.armor],
    [item.power != null ? 'power' : 'energy', item.power ?? item.energy],
    ['masteryReq', item.masteryReq]
  ].filter(([, val]) => val !== undefined && val !== null);

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="modal-body">
          <div className="modal-image-col">
            <div className="modal-card-frame">
              {img ? (
                <img src={img} alt={item.name} className="modal-img" />
              ) : (
                <div className="modal-img-ph">◯</div>
              )}
              <div className="modal-card-name">{item.name}</div>
            </div>

            <button type="button" className="btn-flip3d" onClick={() => setShowSpin(true)}>
              ↻ Ver carta giratoria
            </button>
          </div>

          <div className="modal-info-col">
            {item.type && (
              <div className="modal-tags">
                <span className="tag">{item.type}</span>
              </div>
            )}

            <div className="info-panel">
              <div className="info-panel-title">Descripción</div>
              <p className="info-panel-desc">
                {formatGameText(item.description) || 'Descripción no disponible.'}
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
                  <span className="stat-value">{maestria === 30 ? '30 ★' : maestria}</span>
                </div>
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
          <SpinCardOverlay img={img} name={item.name} isPrime={false} onClose={() => setShowSpin(false)} />
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { imageUrl } from '../api/modsApi';
import { translatePolarities, rarityLabel, modCategories, displayModName } from '../data/translations';
import { formatGameText } from '../utils/gameText';
import SpinCardOverlay from './SpinCardOverlay';
import SmartImage from './SmartImage';
import QuantityStepper from './QuantityStepper';

export default function ModModal({ detail, cantidad = 0, onCantidadChange, warframeNames, onClose }) {
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
  const item = detail;

  const img = imageUrl(item);
  const polarities = translatePolarities(item.polarity ? [item.polarity] : item.polarities);
  const categorias = modCategories(item, warframeNames);
  const nombre = displayModName(item);
  const maxLevel = Array.isArray(item.levelStats) && item.levelStats.length > 0
    ? item.levelStats[item.levelStats.length - 1]
    : null;

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="modal-body">
          <div className="modal-image-col">
            <div className="modal-card-frame">
              <SmartImage
                src={img}
                alt={nombre}
                className="modal-img"
                placeholder="◆"
                placeholderClassName="modal-img-ph"
              />
              <div className="modal-card-name">{nombre}</div>
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

            <QuantityStepper cantidad={cantidad} onChange={(n) => onCantidadChange(item.id, n)} />
          </div>

          <div className="modal-info-col">
            <div className="modal-tags">
              {categorias.map((cat) => (
                <span className="tag" key={cat}>
                  {cat}
                </span>
              ))}
              {item.rarity && <span className="tag tag-muted">{rarityLabel(item.rarity)}</span>}
              {item.baseDrain != null && <span className="tag tag-muted">Drenaje base: {item.baseDrain}</span>}
              {item.fusionLimit != null && <span className="tag tag-muted">Rango máx.: {item.fusionLimit}</span>}
            </div>

            <div className="info-panel">
              <div className="info-panel-title">Descripción</div>
              <p className="info-panel-desc">
                {formatGameText(item.description) || 'Descripción no disponible.'}
              </p>
            </div>

            {maxLevel && Array.isArray(maxLevel.stats) && maxLevel.stats.length > 0 && (
              <div className="info-panel passive-panel">
                <div className="info-panel-title">Efecto a rango máximo</div>
                <ul className="mod-stats-list">
                  {maxLevel.stats.map((line, i) => (
                    <li key={i}>{formatGameText(line)}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {showSpin && (
          <SpinCardOverlay img={img} name={nombre} isPrime={false} onClose={() => setShowSpin(false)} />
        )}
      </div>
    </div>
  );
}

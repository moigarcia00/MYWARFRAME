import { useEffect, useState } from 'react';
import { imageUrl } from '../api/weaponsApi';
import {
  statLabel,
  categoryLabel,
  damageTypeLabel,
  formatWeaponStat,
  displayWeaponName,
  maxMasteryFor,
  WEAPON_STAT_KEYS
} from '../data/translations';
import { formatGameText } from '../utils/gameText';
import SpinCardOverlay from './SpinCardOverlay';

// Categorías donde el "type" que da la API (a menudo "Archwing") es
// redundante con la categoría del catálogo (Archwing/Arch-Gun/Arch-Melee)
// y no aporta nada nuevo, así que no se muestra como tag aparte.
const ARCHWING_FAMILY = new Set(['Arch-Gun', 'Arch-Melee', 'Archwing']);

export default function WeaponModal({ detail, maestria = 0, onClose }) {
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
  const { item, img: skinImg, skinNombre, skinDesc } = detail;

  const isPrime = /prime/i.test(item.name);
  const img = skinImg || imageUrl(item);
  const esOriginal = !skinNombre || skinNombre === 'Original';
  const nombreBase = displayWeaponName(item);
  const cardName = esOriginal ? nombreBase : `${nombreBase} — ${skinNombre}`;
  const maxMastery = maxMasteryFor(item);

  const showTypeTag =
    item.type && item.type !== item.category && !ARCHWING_FAMILY.has(item.category);

  const stats = WEAPON_STAT_KEYS.map((key) => [key, item[key]]).filter(
    ([, val]) => val !== undefined && val !== null
  );

  const damageSource = item.damagePerShot || item.damage || null;
  const damageEntries =
    damageSource && typeof damageSource === 'object'
      ? Object.entries(damageSource).filter(([, v]) => typeof v === 'number' && v > 0)
      : [];

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
                <img src={img} alt={nombreBase} className="modal-img" />
              ) : (
                <div className="modal-img-ph">◯</div>
              )}
              <div className="modal-card-name">{cardName}</div>
            </div>

            <button type="button" className="btn-flip3d" onClick={() => setShowSpin(true)}>
              ↻ Ver carta giratoria
            </button>
          </div>

          <div className="modal-info-col">
            <div className="modal-tags">
              {item.category && <span className="tag">{categoryLabel(item.category)}</span>}
              {showTypeTag && <span className="tag tag-muted">{item.type}</span>}
              {item.vaulted && <span className="tag tag-vaulted">Bóveda</span>}
              <span className="tag tag-muted">
                Aspecto: {esOriginal ? 'Original' : skinNombre}
              </span>
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
                    <span className="stat-value">{formatWeaponStat(key, val)}</span>
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

            {damageEntries.length > 0 && (
              <div className="info-panel">
                <div className="info-panel-title">Daño por disparo</div>
                <div className="damage-bars">
                  {damageEntries
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, val]) => (
                      <div className="damage-row" key={type}>
                        <span className="damage-label">{damageTypeLabel(type)}</span>
                        <span className="damage-value">{Math.round(val * 10) / 10}</span>
                      </div>
                    ))}
                </div>
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

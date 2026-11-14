import { useEffect } from 'react';
import SmartImage from './SmartImage';
import { statLabel, damageTypeLabel, resistanceTypeLabel } from '../data/translations';
import { formatGameText } from '../utils/gameText';

function modifierLabel(modifier) {
  if (typeof modifier !== 'number') return null;
  const pct = Math.round(modifier * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

export default function EnemyModal({ enemy, onToggle, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!enemy) return null;

  const stats = [
    ['health', enemy.health],
    ['shield', enemy.shield],
    ['armor', enemy.armor]
  ].filter(([, value]) => value !== undefined && value !== null);

  const resistances = Array.isArray(enemy.resistances) ? enemy.resistances : [];

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
                src={enemy.imagenUrl}
                alt={enemy.nombre}
                className="modal-img"
                placeholder="☠"
                placeholderClassName="modal-img-ph"
              />
              <div className="modal-card-name">{enemy.nombre}</div>
            </div>

            <button
              type="button"
              className={`skin-btn helminto-btn ${enemy.escaneado ? 'helminto-on' : ''}`}
              onClick={() => onToggle(enemy)}
            >
              <span>◎ Escaneado</span>
              <span className="helminto-check">{enemy.escaneado ? '✓' : '○'}</span>
            </button>
          </div>

          <div className="modal-info-col">
            <div className="modal-tags">
              <span className="tag">{enemy.faccion || 'Sin facción'}</span>
              {enemy.type && <span className="tag tag-muted">{enemy.type}</span>}
              <span className={`tag ${enemy.escaneado ? '' : 'tag-muted'}`}>
                {enemy.escaneado ? 'Escaneado' : 'Sin escanear'}
              </span>
            </div>

            <div className="info-panel">
              <div className="info-panel-title">{enemy.manual ? 'Notas' : 'Descripción'}</div>
              <p className="info-panel-desc">
                {enemy.manual
                  ? enemy.notas || 'Sin notas.'
                  : formatGameText(enemy.description) || 'Descripción no disponible.'}
              </p>
            </div>

            {stats.length > 0 && (
              <div className="stat-grid">
                {stats.map(([key, value]) => (
                  <div className="stat-cell" key={key}>
                    <span className="stat-label">{statLabel(key)}</span>
                    <span className="stat-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {resistances.length > 0 && (
              <div className="abilities-list">
                <div className="info-panel-title">Resistencias</div>
                {resistances.map((resistance, index) => (
                  <div className="ability-row" key={index}>
                    <span className="ability-number">◈</span>
                    <div>
                      <div className="ability-name">
                        {resistanceTypeLabel(resistance.type)}
                        {resistance.amount ? ` (${resistance.amount})` : ''}
                      </div>
                      <div className="ability-desc">
                        {Array.isArray(resistance.affectors) && resistance.affectors.length > 0
                          ? resistance.affectors
                              .map(
                                (affector) =>
                                  `${damageTypeLabel(affector.element)} ${
                                    modifierLabel(affector.modifier) ?? '0%'
                                  }`
                              )
                              .join(' · ')
                          : 'Sin detalles.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

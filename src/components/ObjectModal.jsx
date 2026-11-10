import { imageUrl } from '../api/objectsApi';
import { objectCategory } from '../data/translations';
import { dropsFor } from '../api/dropsApi';
import { relicsContaining } from '../api/relicsApi';
import { formatGameText } from '../utils/gameText';
import SmartImage from './SmartImage';
import QuantityStepper from './QuantityStepper';

function formatChance(chance) {
  if (typeof chance !== 'number') return null;
  const pct = chance <= 1 ? chance * 100 : chance;
  return `${Math.round(pct * 100) / 100}%`;
}

export default function ObjectModal({ detail, cantidad = 0, onCantidadChange, dropsIndex, relics, onClose }) {
  if (!detail) return null;
  const img = imageUrl(detail);

  const relicMatches = relics
    ? [
        ...relicsContaining(relics, detail.name),
        ...(detail.rawName ? relicsContaining(relics, detail.rawName) : [])
      ].filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    : [];

  const allDrops = dropsIndex ? dropsFor(dropsIndex, detail.name, detail.rawName) : [];
  const componentDrops = detail.componentDrops || [];
  const dropMatches = [...componentDrops, ...allDrops]
    .filter((d, i, arr) => arr.findIndex((x) => x.place === d.place) === i)
    .sort((a, b) => (b.chance || 0) - (a.chance || 0));

  const shownDrops = dropMatches.slice(0, 8);
  const extraDrops = dropMatches.length - shownDrops.length;

  const hasObtainInfo = relicMatches.length > 0 || dropMatches.length > 0;

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
                alt={detail.name}
                className="modal-img"
                placeholder="◆"
                placeholderClassName="modal-img-ph"
              />
              <div className="modal-card-name">{detail.name}</div>
            </div>

            <QuantityStepper cantidad={cantidad} onChange={(n) => onCantidadChange(detail.id, n)} />
          </div>

          <div className="modal-info-col">
            <div className="modal-tags">
              <span className="tag">{objectCategory(detail)}</span>
              {detail.tradable != null && (
                <span className="tag tag-muted">{detail.tradable ? 'Intercambiable' : 'No intercambiable'}</span>
              )}
            </div>

            <div className="info-panel">
              <div className="info-panel-title">Descripción</div>
              <p className="info-panel-desc">
                {formatGameText(detail.description) || 'Descripción no disponible.'}
              </p>
            </div>

            {hasObtainInfo ? (
              <div className="abilities-list">
                <div className="info-panel-title">Cómo conseguirlo</div>

                {relicMatches.map((r) => (
                  <div className="ability-row" key={`relic-${r.id}`}>
                    <span className="ability-number">◈</span>
                    <div>
                      <div className="ability-name">Reliquia {r.name}</div>
                      <div className="ability-desc">{r.vaulted ? 'En bóveda' : 'Disponible en misiones'}</div>
                    </div>
                  </div>
                ))}

                {shownDrops.map((d, i) => (
                  <div className="ability-row" key={`drop-${i}`}>
                    <span className="ability-number">◎</span>
                    <div>
                      <div className="ability-name">{d.place}</div>
                      <div className="ability-desc">
                        {formatChance(d.chance)}
                        {d.rotation ? ` · Rotación ${d.rotation}` : ''}
                        {d.rarity ? ` · ${d.rarity}` : ''}
                      </div>
                    </div>
                  </div>
                ))}

                {extraDrops > 0 && (
                  <div className="ability-row">
                    <span className="ability-number">…</span>
                    <div className="ability-desc">y {extraDrops} sitio(s) más</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="info-panel">
                <div className="info-panel-title">Cómo conseguirlo</div>
                <p className="info-panel-desc">
                  {dropsIndex
                    ? 'No se encontró información de obtención para este objeto.'
                    : 'Cargando información de obtención…'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

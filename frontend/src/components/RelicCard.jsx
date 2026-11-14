import SmartImage from './SmartImage';
import { relicImageUrl } from '../api/relicsApi';

const TIER_CLASS = {
  Lith: 'tier-lith',
  Meso: 'tier-meso',
  Neo: 'tier-neo',
  Axi: 'tier-axi',
  Requiem: 'tier-requiem'
};

export default function RelicCard({ relic, total, onMostrar }) {
  const obtenido = total > 0;

  return (
    <div
      className={`personaje relic-card ${TIER_CLASS[relic.era] || ''} ${obtenido ? 'desbloqueado' : ''}`}
      onClick={() => onMostrar(relic)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onMostrar(relic)}
    >
      {relic.vaulted && <span className="card-badge relic-vaulted-badge" title="En bóveda">🔒</span>}
      {relic.special && <span className="card-badge relic-special-badge" title="Sicario Kuva">⚔</span>}

      <div className="relic-icon-wrap">
        <SmartImage
          src={relicImageUrl(relic)}
          alt={relic.name}
          className="relic-img"
          placeholder="◆"
          placeholderClassName="relic-icon"
        />
      </div>

      <div className="nombre">{relic.name}</div>
      {total > 0 && <div className="relic-total-badge">×{total}</div>}

      <button
        type="button"
        className="btn-mostrar"
        onClick={(e) => {
          e.stopPropagation();
          onMostrar(relic);
        }}
      >
        Mostrar
      </button>
    </div>
  );
}

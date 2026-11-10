import MasteryBar from './MasteryBar';
import { displayWeaponName, maxMasteryFor } from '../data/translations';

export default function WeaponCard({
  item,
  displayImg,
  obtenido,
  onToggleObtenido,
  skinNombre,
  onOpenSkinPicker,
  mastery,
  onMasteryChange,
  onMostrar
}) {
  const isPrime = /prime/i.test(item.name);
  const nombre = displayWeaponName(item);
  const maxMastery = maxMasteryFor(item);

  return (
    <div
      className={`personaje ${obtenido ? 'desbloqueado' : ''} ${isPrime ? 'prime' : ''}`}
      onClick={() => onToggleObtenido(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggleObtenido(item.id)}
    >
      <span className="card-badge">{obtenido ? '✓' : '○'}</span>

      <div className="card-img">
        {displayImg ? (
          <img className="img-principal" src={displayImg} alt={nombre} loading="lazy" />
        ) : (
          <div className="placeholder">⬡</div>
        )}
      </div>

      <div className="nombre">{nombre}</div>

      <button
        type="button"
        className="btn-mostrar"
        onClick={(e) => {
          e.stopPropagation();
          onMostrar(item);
        }}
      >
        Mostrar
      </button>

      <button
        type="button"
        className="skin-btn"
        onClick={(e) => {
          e.stopPropagation();
          onOpenSkinPicker(item);
        }}
      >
        <span>🎨 Skin</span>
        <span className="skin-btn-nombre">{skinNombre}</span>
      </button>

      <MasteryBar
        rango={mastery}
        max={maxMastery}
        onChange={(n) => onMasteryChange(item.id, n, maxMastery)}
      />
    </div>
  );
}

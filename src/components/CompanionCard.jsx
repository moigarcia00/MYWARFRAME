import MasteryBar from './MasteryBar';

export default function CompanionCard({ item, displayImg, obtenido, onToggleObtenido, mastery, onMasteryChange, onMostrar }) {
  return (
    <div
      className={`personaje ${obtenido ? 'desbloqueado' : ''}`}
      onClick={() => onToggleObtenido(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggleObtenido(item.id)}
    >
      <span className="card-badge">{obtenido ? '✓' : '○'}</span>

      <div className="card-img">
        {displayImg ? (
          <img className="img-principal" src={displayImg} alt={item.name} loading="lazy" />
        ) : (
          <div className="placeholder">⬡</div>
        )}
      </div>

      <div className="nombre">{item.name}</div>

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

      <MasteryBar rango={mastery} onChange={(n) => onMasteryChange(item.id, n)} />
    </div>
  );
}

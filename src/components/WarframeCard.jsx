import MasteryBar from './MasteryBar';
import { maxMasteryFor } from '../data/translations';

export default function WarframeCard({
  item,
  displayImg,
  obtenido,
  onToggleObtenido,
  skinNombre,
  onOpenSkinPicker,
  helmetNombre,
  onOpenHelmetPicker,
  mastery,
  onMasteryChange,
  helminto,
  onToggleHelminto,
  onMostrar
}) {
  const isPrime = /prime/i.test(item.name);
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

      <button
        type="button"
        className={`skin-btn helminto-btn ${helminto ? 'helminto-on' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleHelminto(item.id);
        }}
        title="¿Se ha dado a Helminto para desbloquear su habilidad transferible?"
      >
        <span>🧬 Helminto</span>
        <span className="helminto-check">{helminto ? '✓' : '○'}</span>
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

      <button
        type="button"
        className="skin-btn helmet-btn"
        onClick={(e) => {
          e.stopPropagation();
          onOpenHelmetPicker(item);
        }}
      >
        <span>⛑ Helmet</span>
        <span className="helmet-btn-nombre">{helmetNombre}</span>
      </button>

      <MasteryBar
        rango={mastery}
        max={maxMastery}
        onChange={(n) => onMasteryChange(item.id, n, maxMastery)}
      />
    </div>
  );
}

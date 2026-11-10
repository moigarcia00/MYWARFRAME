import { translatePolarities } from '../data/translations';

export default function RivenCard({ riven, onEdit, onDelete }) {
  const polarity = translatePolarities(riven.polaridad ? [riven.polaridad] : [])[0];

  return (
    <div className="riven-card">
      <div className="riven-card-top">
        <div>
          <div className="riven-card-nombre">{riven.nombre || 'Riven sin nombre'}</div>
          <div className="riven-card-arma">{riven.arma || 'Arma no especificada'}</div>
        </div>
        {polarity && (
          <span className="polarity-chip" title={polarity.label}>
            {polarity.symbol}
          </span>
        )}
      </div>

      <div className="riven-stats">
        {(riven.stats || []).map((s, i) => (
          <div key={i} className={`riven-stat ${s.positivo === false ? 'negativo' : 'positivo'}`}>
            {s.positivo === false ? '−' : '+'}
            {s.valor}
            {s.esPorcentaje !== false ? '%' : ''} {s.nombre}
          </div>
        ))}
      </div>

      <div className="riven-card-meta">
        {riven.rango != null && <span>Rango {riven.rango}/8</span>}
        {riven.maestria != null && <span>MR {riven.maestria}</span>}
        {riven.disposicion && <span>Disp. {riven.disposicion}</span>}
      </div>

      <div className="riven-card-actions">
        <button type="button" className="riven-edit" onClick={() => onEdit(riven)}>
          Editar
        </button>
        <button type="button" className="riven-delete" onClick={() => onDelete(riven.id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

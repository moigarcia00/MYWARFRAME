import SmartImage from './SmartImage';

export default function EnemyCard({ enemy, onToggle, onMostrar, onEdit, onDelete }) {
  const escaneado = !!enemy.escaneado;

  return (
    <div
      className={`personaje ${escaneado ? 'desbloqueado' : ''}`}
      onClick={() => onMostrar(enemy)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onMostrar(enemy)}
    >
      <span className="card-badge">{escaneado ? '✓' : '○'}</span>

      <div className="card-img">
        <SmartImage
          src={enemy.imagenUrl}
          alt={enemy.nombre}
          className="img-principal"
          placeholder="☠"
          placeholderClassName="placeholder"
        />
      </div>

      <div className="nombre">{enemy.nombre || 'Enemigo sin nombre'}</div>
      <div className="enemy-card-faccion">{enemy.faccion || 'Sin facción'}</div>

      <button
        type="button"
        className="btn-mostrar"
        onClick={(e) => {
          e.stopPropagation();
          onMostrar(enemy);
        }}
      >
        Mostrar
      </button>

      <button
        type="button"
        className={`skin-btn helminto-btn ${escaneado ? 'helminto-on' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(enemy);
        }}
        title={escaneado ? 'Marcado como escaneado' : 'Marcar como escaneado'}
      >
        <span>◎ Escaneado</span>
        <span className="helminto-check">{escaneado ? '✓' : '○'}</span>
      </button>

      {enemy.manual && (
        <div className="riven-card-actions enemy-card-actions">
          <button
            type="button"
            className="riven-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(enemy);
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="riven-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(enemy.id);
            }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

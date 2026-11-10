export default function EnemyCard({ enemy, onToggle, onEdit, onDelete }) {
  return (
    <div className={`enemy-card ${enemy.escaneado ? 'escaneado' : ''}`}>
      {enemy.imagenUrl && (
        <div className="enemy-card-img-wrap">
          <img src={enemy.imagenUrl} alt={enemy.nombre} className="enemy-card-img" />
        </div>
      )}

      <div className="enemy-card-top">
        <div>
          <div className="enemy-card-nombre">{enemy.nombre || 'Enemigo sin nombre'}</div>
          <div className="enemy-card-faccion">{enemy.faccion || 'Facción sin especificar'}</div>
        </div>
        <button
          type="button"
          className={`enemy-scan-toggle ${enemy.escaneado ? 'on' : ''}`}
          onClick={() => onToggle(enemy.id)}
          title={enemy.escaneado ? 'Marcado como escaneado' : 'Marcar como escaneado'}
        >
          {enemy.escaneado ? '✓ Escaneado' : '○ Sin escanear'}
        </button>
      </div>

      {enemy.notas && <p className="enemy-card-notas">{enemy.notas}</p>}

      <div className="riven-card-actions">
        <button type="button" className="riven-edit" onClick={() => onEdit(enemy)}>
          Editar
        </button>
        <button type="button" className="riven-delete" onClick={() => onDelete(enemy.id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

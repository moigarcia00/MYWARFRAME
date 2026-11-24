export default function PickerModal({
  title,
  icon,
  options,
  active,
  isPrime,
  isOwned,
  onToggleOwned,
  onSelect,
  onClose
}) {
  if (!options) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className={`modal ${isPrime ? 'prime-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <div className="modal-title">
          {icon} {title}
        </div>
        <div className="skin-grid">
          {options.map((opt) => (
            <div
              key={opt.nombre}
              className={`skin-card ${active === opt.nombre ? 'activa' : ''}`}
              onClick={() => {
                onSelect(opt.nombre);
                onClose();
              }}
            >
              <span className="skin-card-tick">✓</span>

              {opt.nombre !== 'Original' && (
                <button
                  type="button"
                  className={`skin-owned-check ${isOwned?.(opt.nombre) ? 'checked' : ''}`}
                  title={isOwned?.(opt.nombre) ? 'Marcado como obtenido' : 'Marcar como obtenido'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleOwned?.(opt.nombre);
                  }}
                >
                  ✓
                </button>
              )}

              {opt.img ? (
                <img className="skin-card-img" src={opt.img} alt={opt.nombre} loading="lazy" />
              ) : (
                <div className="skin-card-img-ph">{icon}</div>
              )}
              <div className="skin-card-nombre">{opt.nombre}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

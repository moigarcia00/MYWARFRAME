import QuantityStepper from './QuantityStepper';
import SmartImage from './SmartImage';

export default function ObjectCard({ item, displayImg, cantidad, onCantidadChange, onMostrar }) {
  const obtenido = cantidad > 0;

  return (
    <div
      className={`personaje ${obtenido ? 'desbloqueado' : ''}`}
      onClick={() => onMostrar(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onMostrar(item)}
    >
      <div className="card-img">
        <SmartImage
          src={displayImg}
          alt={item.name}
          className="img-principal"
          placeholder="◆"
          placeholderClassName="placeholder"
        />
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

      <QuantityStepper cantidad={cantidad} onChange={(n) => onCantidadChange(item.id, n)} />
    </div>
  );
}

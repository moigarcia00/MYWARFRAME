import { memo } from 'react';
import QuantityStepper from './QuantityStepper';
import SmartImage from './SmartImage';
import { rarityLabel, displayModName } from '../data/translations';

function ModCard({ item, displayImg, cantidad, onCantidadChange, onMostrar }) {
  const obtenido = cantidad > 0;
  const nombre = displayModName(item);

  return (
    <div
      className={`personaje mod-card rareza-${String(item.rarity || '').toLowerCase()} ${
        obtenido ? 'desbloqueado' : ''
      }`}
      onClick={() => onMostrar(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onMostrar(item)}
    >
      {item.rarity && <span className="card-badge rarity-badge">{rarityLabel(item.rarity)[0]}</span>}

      <div className="card-img">
        <SmartImage
          src={displayImg}
          alt={nombre}
          className="img-principal"
          placeholder="◆"
          placeholderClassName="placeholder"
        />
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

      <QuantityStepper cantidad={cantidad} onChange={(n) => onCantidadChange(item.id, n)} />
    </div>
  );
}

export default memo(ModCard);

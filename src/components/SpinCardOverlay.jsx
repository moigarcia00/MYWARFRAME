import { useState } from 'react';

// Logo de la página, cara trasera de la carta giratoria. Vive en
// img/logo.png (raíz del proyecto) → servido como "/logo.png".
const LOGO_SRC = '/logo.png';

// Carta que gira sola sin parar (imagen + nombre de frente, logo de la
// página al dorso). Un clic fuera de la carta la cierra.
export default function SpinCardOverlay({ img, name, isPrime, onClose }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="spin-overlay" onClick={onClose}>
      <div className="spin-card-wrap">
        <div className={`spin-card-inner ${isPrime ? 'prime' : ''}`}>
          <div className="spin-face spin-front">
            {img ? (
              <img src={img} alt={name} className="spin-card-img" />
            ) : (
              <div className="spin-card-img-ph">◯</div>
            )}
            <div className="spin-card-name">{name}</div>
          </div>

          <div className="spin-face spin-back">
            {!logoError ? (
              <img
                src={LOGO_SRC}
                alt="MyWarframe"
                className="spin-card-logo"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="spin-card-img-ph">◈</div>
            )}
          </div>
        </div>
      </div>
      <div className="spin-hint">Clic fuera de la carta para cerrar</div>
    </div>
  );
}

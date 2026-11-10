import { useState } from 'react';

// Algunos mods traen una imagen "válida" (la petición no falla) pero el
// archivo en sí está en blanco/gris liso — un hueco de arte que WFCD aún
// no ha rellenado. Se intenta detectar tomando una muestra de píxeles con
// un canvas al cargar la imagen: si casi no hay variación de color, se
// asume en blanco y se muestra el icono de repuesto en su lugar.
//
// IMPORTANTE: no se pone crossOrigin="anonymous" en el <img>. Si el CDN de
// WFCD no manda cabeceras CORS (lo normal en un CDN de imágenes), pedir
// crossOrigin hace que el navegador BLOQUEE la imagen entera en vez de
// solo impedir leerla con canvas — o sea, rompe imágenes que sí
// funcionaban bien. Sin ese atributo, las imágenes siempre se cargan y
// se ven con normalidad; lo único que puede pasar es que el muestreo con
// canvas falle silenciosamente (canvas "contaminado" por CORS), en cuyo
// caso simplemente no se detecta el caso en blanco y se deja la imagen
// tal cual — nunca al revés.
const blankCache = new Map();
let scanBudget = 250;

function looksBlank(img, src) {
  if (blankCache.has(src)) return blankCache.get(src);
  if (scanBudget <= 0) return false;
  scanBudget -= 1;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 8, 8);
    const { data } = ctx.getImageData(0, 0, 8, 8);
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const result = max - min < 6;
    blankCache.set(src, result);
    return result;
  } catch {
    blankCache.set(src, false);
    return false;
  }
}

export default function SmartImage({ src, alt, className, placeholder, placeholderClassName }) {
  const [broken, setBroken] = useState(false);
  const [blank, setBlank] = useState(false);

  if (!src || broken || blank) {
    return <div className={placeholderClassName}>{placeholder}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setBroken(true)}
      onLoad={(e) => {
        if (looksBlank(e.currentTarget, src)) setBlank(true);
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════
// Copia de seguridad de toda la colección, sin necesidad de ningún
// servidor/hosting: exporta todo lo guardado en localStorage a un
// archivo .json que el usuario se descarga, y lo puede volver a cargar
// en cualquier otro navegador/dispositivo/persona que abra esta misma
// app. Es la única forma de "sincronizar" sin backend: un archivo que
// tú mismo guardas y compartes.
// ══════════════════════════════════════════════════════════

import { BACKUP_KEYS } from './storageKeys';

export function hasAnyBackupData() {
  return BACKUP_KEYS.some((k) => localStorage.getItem(k) !== null);
}

export function exportBackup() {
  const data = {};
  BACKUP_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw !== null) data[key] = raw;
  });

  const payload = {
    app: 'MyWarframe',
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };

  const stamp = payload.exportedAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mywarframe-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Devuelve cuántas claves se restauraron. Lanza si el archivo no es un
// JSON válido o no tiene ningún dato reconocible.
export function importBackup(fileText) {
  const parsed = JSON.parse(fileText);
  const data = parsed && typeof parsed.data === 'object' ? parsed.data : parsed;
  if (!data || typeof data !== 'object') {
    throw new Error('El archivo no tiene el formato esperado.');
  }

  let count = 0;
  BACKUP_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      localStorage.setItem(key, data[key]);
      count += 1;
    }
  });

  if (count === 0) {
    throw new Error('El archivo no contenía ninguna clave reconocida de MyWarframe.');
  }
  return count;
}

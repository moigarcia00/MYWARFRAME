import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { exportBackup, importBackup } from '../utils/backup';

export default function BackupModal({ onClose }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { type: 'ok'|'error', text }

  function handleExport() {
    try {
      exportBackup();
      setStatus({ type: 'ok', text: 'Descarga iniciada.' });
    } catch {
      setStatus({ type: 'error', text: 'No se pudo generar el archivo de copia.' });
    }
  }

  function handleFileChosen(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        'Esto reemplaza tu colección actual guardada en este navegador con la del archivo. ¿Continuar?'
      )
    ) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const count = importBackup(String(reader.result));
        setStatus({ type: 'ok', text: `Importado correctamente (${count} claves). Recargando…` });
        setTimeout(() => window.location.reload(), 900);
      } catch (err) {
        setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Archivo inválido.' });
      }
    };
    reader.onerror = () => setStatus({ type: 'error', text: 'No se pudo leer el archivo.' });
    reader.readAsText(file);
    e.target.value = '';
  }

  return createPortal(
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal backup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <div className="modal-title">💾 Copia de seguridad</div>

        <p className="backup-desc">
          Todo tu progreso (obtenidos, maestría, skins, cantidades, agrietados...) se guarda solo
          en este navegador. Esta app no tiene servidor propio, así que la única forma de
          llevártelo a otro dispositivo o compartirlo con alguien es con un archivo: te lo
          descargas aquí, y esa persona lo importa desde este mismo botón en su navegador.
        </p>

        <div className="backup-actions">
          <button type="button" className="backup-btn backup-export" onClick={handleExport}>
            ⬇ Descargar copia de seguridad
          </button>

          <label className="backup-btn backup-import">
            ⬆ Importar copia de seguridad
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChosen}
              hidden
            />
          </label>
        </div>

        {status && (
          <p className={`backup-status ${status.type === 'error' ? 'backup-status-error' : ''}`}>
            {status.text}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

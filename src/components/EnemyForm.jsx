import { useState } from 'react';
import { resizeImageFile } from '../utils/resizeImage';

function emptyForm(defaultFaccion) {
  return { nombre: '', faccion: defaultFaccion || '', notas: '', escaneado: false, imagenUrl: '' };
}

export default function EnemyForm({ initial, factions, defaultFaccion, onSave, onCancel }) {
  const [form, setForm] = useState(() =>
    initial ? { ...emptyForm(defaultFaccion), ...initial } : emptyForm(defaultFaccion)
  );
  const [imgError, setImgError] = useState(null);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError(null);
    try {
      const dataUrl = await resizeImageFile(file);
      setField('imagenUrl', dataUrl);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : 'No se pudo cargar la imagen.');
    }
    e.target.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave(form);
  }

  return (
    <form className="riven-form" onSubmit={handleSubmit}>
      <div className="riven-form-row">
        <label>
          Nombre del enemigo
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
            placeholder="ej: Napalm, Bursa, Ancestral Tóxico..."
            required
          />
        </label>

        <label>
          Facción
          <select value={form.faccion} onChange={(e) => setField('faccion', e.target.value)}>
            <option value="">— Elige una facción —</option>
            {(factions || []).map((f) => (
              <option value={f.name} key={f.key}>
                {f.name}
              </option>
            ))}
            {form.faccion && !(factions || []).some((f) => f.name === form.faccion) && (
              <option value={form.faccion}>{form.faccion} (personalizada)</option>
            )}
          </select>
        </label>
      </div>

      <label className="enemy-notas-label">
        Notas
        <textarea
          value={form.notas}
          onChange={(e) => setField('notas', e.target.value)}
          placeholder="ej: falta rango de escaneo, dónde lo has visto, variante nightmare..."
          rows={3}
        />
      </label>

      <label className="enemy-notas-label">
        Imagen de referencia (opcional)
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>
      {imgError && <p className="enemy-img-error">{imgError}</p>}
      {form.imagenUrl && (
        <div className="enemy-img-preview-wrap">
          <img src={form.imagenUrl} alt="Vista previa" className="enemy-img-preview" />
          <button type="button" className="riven-stat-remove" onClick={() => setField('imagenUrl', '')}>
            ×
          </button>
        </div>
      )}

      <label className="enemy-checkbox-label">
        <input
          type="checkbox"
          checked={form.escaneado}
          onChange={(e) => setField('escaneado', e.target.checked)}
        />
        Ya lo he escaneado
      </label>

      <div className="riven-form-actions">
        <button type="button" className="riven-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="riven-save">
          Guardar enemigo
        </button>
      </div>
    </form>
  );
}

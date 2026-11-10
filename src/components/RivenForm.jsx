import { useState } from 'react';
import { DAMAGE_TYPE_ES } from '../data/translations';

const POLARITY_OPTIONS = ['madurai', 'vazarin', 'naramon', 'zenurik', 'umbra'];
const POLARITY_LABEL = {
  madurai: '▲ Madurai',
  vazarin: '◐ Vazarin',
  naramon: '◇ Naramon',
  zenurik: '⊃ Zenurik',
  umbra: '✳ Umbra'
};

const RIVEN_DAMAGE_TYPES = [
  'impact',
  'puncture',
  'slash',
  'heat',
  'cold',
  'electricity',
  'toxin',
  'blast',
  'radiation',
  'gas',
  'magnetic',
  'viral',
  'corrosive'
];

const RIVEN_STAT_SUGGESTIONS = [
  ...RIVEN_DAMAGE_TYPES.map((key) => DAMAGE_TYPE_ES[key]),
  'Daño',
  'Probabilidad crítica',
  'Multiplicador crítico',
  'Multishot',
  'Probabilidad de estado',
  'Cadencia de disparo',
  'Alcance',
  'Velocidad de recarga',
  'Capacidad del cargador',
  'Eficiencia de munición',
  'Velocidad de proyectil',
  'Daño de facción'
];

function emptyStat() {
  return { nombre: '', valor: '', positivo: true, esPorcentaje: true };
}

function emptyForm() {
  return {
    nombre: '',
    arma: '',
    polaridad: 'madurai',
    rango: 8,
    maestria: 8,
    disposicion: '',
    stats: [emptyStat(), emptyStat()]
  };
}

export default function RivenForm({ initial, weaponNames, onSave, onCancel }) {
  const [form, setForm] = useState(() => (initial ? { ...emptyForm(), ...initial } : emptyForm()));

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setStat(idx, field, value) {
    setForm((f) => {
      const stats = [...f.stats];
      stats[idx] = { ...stats[idx], [field]: value };
      return { ...f, stats };
    });
  }

  function addStat() {
    if (form.stats.length >= 5) return;
    setForm((f) => ({ ...f, stats: [...f.stats, emptyStat()] }));
  }

  function removeStat(idx) {
    setForm((f) => ({ ...f, stats: f.stats.filter((_, i) => i !== idx) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.arma.trim()) return;
    onSave({
      ...form,
      rango: Number(form.rango) || 0,
      maestria: Number(form.maestria) || 0,
      disposicion: form.disposicion ? Number(form.disposicion) : '',
      stats: form.stats
        .filter((s) => s.nombre.trim())
        .map((s) => ({ ...s, valor: Number(s.valor) || 0 }))
    });
  }

  return (
    <form className="riven-form" onSubmit={handleSubmit}>
      <div className="riven-form-row">
        <label>
          Nombre en clave
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
            placeholder="ej: Vastarian Onorix"
            required
          />
        </label>

        <label>
          Arma
          <input
            type="text"
            list="riven-weapon-list"
            value={form.arma}
            onChange={(e) => setField('arma', e.target.value)}
            placeholder="ej: Braton Prime"
            required
          />
          {weaponNames && (
            <datalist id="riven-weapon-list">
              {weaponNames.map((w) => (
                <option value={w} key={w} />
              ))}
            </datalist>
          )}
        </label>
      </div>

      <div className="riven-form-row">
        <label>
          Polaridad
          <select value={form.polaridad} onChange={(e) => setField('polaridad', e.target.value)}>
            {POLARITY_OPTIONS.map((p) => (
              <option value={p} key={p}>
                {POLARITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rango (0-8)
          <input
            type="number"
            min="0"
            max="8"
            value={form.rango}
            onChange={(e) => setField('rango', e.target.value)}
          />
        </label>

        <label>
          Maestría req.
          <input
            type="number"
            min="0"
            max="16"
            value={form.maestria}
            onChange={(e) => setField('maestria', e.target.value)}
          />
        </label>

        <label>
          Disposición
          <input
            type="number"
            step="0.05"
            value={form.disposicion}
            onChange={(e) => setField('disposicion', e.target.value)}
            placeholder="ej: 1.35"
          />
        </label>
      </div>

      <div className="riven-form-stats">
        <div className="riven-form-stats-title">Estadísticas</div>
        <datalist id="riven-stat-list">
          {RIVEN_STAT_SUGGESTIONS.map((name) => (
            <option value={name} key={name} />
          ))}
        </datalist>
        {form.stats.map((s, i) => (
          <div className="riven-stat-row" key={i}>
            <select
              value={s.positivo ? 'pos' : 'neg'}
              onChange={(e) => setStat(i, 'positivo', e.target.value === 'pos')}
            >
              <option value="pos">+</option>
              <option value="neg">−</option>
            </select>
            <input
              type="number"
              step="0.1"
              value={s.valor}
              onChange={(e) => setStat(i, 'valor', e.target.value)}
              placeholder="valor"
              className="riven-stat-valor"
            />
            <select
              value={s.esPorcentaje ? 'pct' : 'flat'}
              onChange={(e) => setStat(i, 'esPorcentaje', e.target.value === 'pct')}
            >
              <option value="pct">%</option>
              <option value="flat">nº</option>
            </select>
            <input
              type="text"
              list="riven-stat-list"
              value={s.nombre}
              onChange={(e) => setStat(i, 'nombre', e.target.value)}
              placeholder="ej: Daño, Crítico, Multi. crítico..."
              className="riven-stat-nombre"
            />
            <button type="button" className="riven-stat-remove" onClick={() => removeStat(i)}>
              ×
            </button>
          </div>
        ))}
        {form.stats.length < 5 && (
          <button type="button" className="riven-stat-add" onClick={addStat}>
            + Añadir estadística
          </button>
        )}
      </div>

      <div className="riven-form-actions">
        <button type="button" className="riven-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="riven-save">
          Guardar agrietado
        </button>
      </div>
    </form>
  );
}

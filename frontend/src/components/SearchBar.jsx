export default function SearchBar({
  value,
  onChange,
  filtroColeccion,
  onSetFiltro,
  placeholder = 'Buscar...',
  showMasteryFilter = false,
  showHelminthFilter = false,
  obtainedLabel = '✓ Solo obtenidos',
  notObtainedLabel = '○ Solo no obtenidos',
  obtainedValue = 'obtenidos',
  notObtainedValue = 'no-obtenidos',
  obtainedTitle = 'Mostrar solo los que están marcados como obtenidos',
  notObtainedTitle = 'Mostrar solo los que aún no tienes',
  children
}) {
  return (
    <div className="search-row">
      <div className="search-wrap">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="search-clear" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
            ×
          </button>
        )}
      </div>

      <button
        type="button"
        className={`filter-obtenidos ${filtroColeccion === obtainedValue ? 'active' : ''}`}
        onClick={() => onSetFiltro(filtroColeccion === obtainedValue ? 'todos' : obtainedValue)}
        title={obtainedTitle}
      >
        {obtainedLabel}
      </button>

      <button
        type="button"
        className={`filter-no-obtenidos ${filtroColeccion === notObtainedValue ? 'active' : ''}`}
        onClick={() => onSetFiltro(filtroColeccion === notObtainedValue ? 'todos' : notObtainedValue)}
        title={notObtainedTitle}
      >
        {notObtainedLabel}
      </button>

      {showMasteryFilter && (
        <button
          type="button"
          className={`filter-maestria ${filtroColeccion === 'maestria' ? 'active' : ''}`}
          onClick={() => onSetFiltro(filtroColeccion === 'maestria' ? 'todos' : 'maestria')}
          title="Mostrar solo los que tienen la maestría al máximo"
        >
          ★ Maestría
        </button>
      )}

      {showHelminthFilter && (
        <button
          type="button"
          className={`filter-maestria ${filtroColeccion === 'helminto' ? 'active' : ''}`}
          onClick={() => onSetFiltro(filtroColeccion === 'helminto' ? 'todos' : 'helminto')}
          title="Mostrar solo los enviados al Helminto"
        >
          🧬 Helminto
        </button>
      )}

      {children}
    </div>
  );
}

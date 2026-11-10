export default function CatalogSections({
  loading,
  error,
  onRetry,
  emptyMessage,
  sections,
  renderItem,
  gridClassName = 'cards-grid',
  loadingMessage = 'Cargando datos desde la base de datos del Origen del Sistema…'
}) {
  if (loading) {
    return (
      <div className="state-msg">
        <div className="spinner" />
        {loadingMessage}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-msg state-error">
        <p>⚠ {error}</p>
        <button className="btn-mostrar" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  const list = Array.isArray(sections)
    ? sections
    : sections
      ? [...sections.entries()].map(([key, items]) => ({
          key,
          title: key,
          dataLetter: key,
          items
        }))
      : [];

  if (list.length === 0) {
    return <div className="state-msg">{emptyMessage}</div>;
  }

  return (
    <>
      {list.map((section) => (
        <section
          className="letra-section"
          id={section.dataLetter ? `letra-${section.dataLetter}` : undefined}
          key={section.key}
        >
          <h2 className="letra-heading" data-letter={section.dataLetter}>
            {section.title}
          </h2>
          <div className={gridClassName}>{section.items.map(renderItem)}</div>
        </section>
      ))}
    </>
  );
}

import Header from './Header';

export default function PageLayout({
  activeTab,
  onSelectTab,
  total,
  obtenidosCount,
  subCounterLabel,
  subCounterValue,
  loading = false,
  error = null,
  onReload,
  footerText = 'Proyecto fan no oficial, sin ánimo de lucro y no afiliado a Digital Extremes. Warframe y sus imágenes son propiedad de Digital Extremes Ltd. Datos: Warframe Community Developers (WFCD).',
  showFooter = true,
  children
}) {
  return (
    <>
      <Header
        total={total}
        obtenidosCount={obtenidosCount}
        subCounterLabel={subCounterLabel}
        subCounterValue={subCounterValue}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />

      {children}

      {showFooter && !loading && !error && (
        <footer>
          {footerText}
          <button className="footer-refresh" onClick={onReload}>
            ↻ Refrescar datos
          </button>
        </footer>
      )}
    </>
  );
}

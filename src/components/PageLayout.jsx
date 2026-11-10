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
  footerText = 'Datos proporcionados por la API de Warframe Community Developers (WFCD)',
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

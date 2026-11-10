import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CatalogSections from '../components/CatalogSections';
import Pagination from '../components/Pagination';
import CategoryTabs from '../components/CategoryTabs';
import RelicCard from '../components/RelicCard';
import RelicModal from '../components/RelicModal';
import { useRelics } from '../hooks/useRelics';
import { useRelicCollection } from '../hooks/useRelicCollection';
import { usePagination } from '../hooks/usePagination';
import { normalize } from '../utils/normalize';

const TIER_ORDER = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];

export default function ReliquiasPage({ activeTab, onSelectTab }) {
  const { relics, loading, error, partial, reload } = useRelics();
  const collection = useRelicCollection();

  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('Todas');
  const [filtroBoveda, setFiltroBoveda] = useState('todas'); // 'todas' | 'disponibles' | 'boveda'
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (relics.length > 0) {
      collection.pruneOrphans(relics.map((r) => r.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relics]);

  const tierInfo = useMemo(() => {
    const counts = new Map();
    relics.forEach((r) => counts.set(r.era, (counts.get(r.era) || 0) + 1));
    const known = TIER_ORDER.filter((t) => counts.has(t));
    const rest = [...counts.keys()].filter((t) => !TIER_ORDER.includes(t)).sort();
    const list = [...known, ...rest].map((key) => ({ key, label: key, count: counts.get(key) }));
    return { list, total: relics.length };
  }, [relics]);

  const filtered = useMemo(() => {
    let list = relics;
    if (tier !== 'Todas') list = list.filter((r) => r.era === tier);
    if (filtroBoveda === 'disponibles') list = list.filter((r) => !r.vaulted);
    if (filtroBoveda === 'boveda') list = list.filter((r) => r.vaulted);
    const term = normalize(search);
    if (term) {
      list = list.filter(
        (r) =>
          normalize(r.name).includes(term) ||
          r.rewards.some((rw) => normalize(rw.item).includes(term))
      );
    }
    return list;
  }, [relics, tier, filtroBoveda, search]);

  const { page: currentPage, totalPages, pageItems, goToPage, resetPage } = usePagination(filtered);

  const grouped = useMemo(() => {
    const map = new Map();
    pageItems.forEach((r) => {
      if (!map.has(r.era)) map.set(r.era, []);
      map.get(r.era).push(r);
    });
    map.forEach((list) => list.sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true })));
    const orderedKeys = [
      ...TIER_ORDER.filter((t) => map.has(t)),
      ...[...map.keys()].filter((t) => !TIER_ORDER.includes(t)).sort()
    ];
    return orderedKeys.map((key) => [key, map.get(key)]);
  }, [pageItems]);

  const sections = useMemo(
    () => grouped.map(([era, items]) => ({ key: era, title: era, dataLetter: era[0], items })),
    [grouped]
  );

  function selectTier(t) {
    setTier(t);
    resetPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeSearch(value) {
    setSearch(value);
    resetPage();
  }

  function changeBoveda(value) {
    setFiltroBoveda(value);
    resetPage();
  }

  return (
    <PageLayout
      total={relics.length}
      obtenidosCount={collection.totalObtenidas}
      subCounterLabel="COPIAS TOTALES"
      subCounterValue={collection.totalCopias}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      loading={loading}
      error={error}
      onReload={reload}
      footerText="Datos de reliquias proporcionados por WFInfo, vía la API de Warframe Community Developers (WFCD)"
    >

      <div className="controls-wrap">
        <div className="search-row">
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar reliquia o recompensa... (ej: Lith A1, Braton Prime)"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`filter-obtenidos ${filtroBoveda === 'disponibles' ? 'active' : ''}`}
            onClick={() => changeBoveda(filtroBoveda === 'disponibles' ? 'todas' : 'disponibles')}
            title="Mostrar todas las reliquias excepto las que están en bóveda"
          >
            ✓ Disponibles
          </button>
          <button
            type="button"
            className={`filter-no-obtenidos ${filtroBoveda === 'boveda' ? 'active' : ''}`}
            onClick={() => changeBoveda(filtroBoveda === 'boveda' ? 'todas' : 'boveda')}
            title="Mostrar solo las reliquias que están en bóveda"
          >
            🔒 Solo en bóveda
          </button>
        </div>
      </div>

      {!loading && !error && partial && (
        <div className="partial-warning">
          ⚠ El catálogo normal de reliquias (WFInfo) no está disponible ahora mismo — solo se
          muestran las Requiem, que son datos añadidos a mano. Prueba a refrescar más tarde.
        </div>
      )}

      {!loading && !error && <CategoryTabs categories={tierInfo} active={tier} onSelect={selectTier} />}

      <main id="top">
        <CatalogSections
          loading={loading}
          error={error}
          onRetry={reload}
          emptyMessage="No se encontraron reliquias con ese criterio."
          sections={sections}
          gridClassName="cards-grid relic-grid"
          renderItem={(relic) => (
            <RelicCard
              key={relic.id}
              relic={relic}
              total={collection.totalDe(relic.id)}
              onMostrar={setDetail}
            />
          )}
        />

        {!loading && !error && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        )}
      </main>

      <RelicModal
        relic={detail}
        cantidades={detail ? collection.getCantidades(detail.id) : { intact: 0, exceptional: 0, flawless: 0, radiant: 0 }}
        onCantidadChange={collection.setCantidad}
        onClose={() => setDetail(null)}
      />
    </PageLayout>
  );
}

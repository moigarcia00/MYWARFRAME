import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CatalogSections from '../components/CatalogSections';
import SearchBar from '../components/SearchBar';
import AlphabetNav from '../components/AlphabetNav';
import CompanionCard from '../components/CompanionCard';
import CompanionModal from '../components/CompanionModal';
import { useCompanions } from '../hooks/useCompanions';
import { useCompanionCollection } from '../hooks/useCompanionCollection';
import { normalize } from '../utils/normalize';
import { groupByLetter, getAvailableLetters } from '../utils/catalog';
import { imageUrl } from '../api/companionsApi';

export default function CompanionsPage({ activeTab, onSelectTab }) {
  const { companions, loading, error, reload } = useCompanions();
  const collection = useCompanionCollection();
  const { isObtenido } = collection;

  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('*');
  const [filtroColeccion, setFiltroColeccion] = useState('todos');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (companions.length > 0) {
      collection.pruneOrphans(companions.map((c) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companions]);

  const filtered = useMemo(() => {
    let list = companions;
    const term = normalize(search);
    if (term) list = list.filter((c) => normalize(c.name).includes(term));
    if (activeLetter !== '*') {
      list = list.filter((c) => normalize(c.name)[0]?.toUpperCase() === activeLetter);
    }
    if (filtroColeccion === 'obtenidos') list = list.filter((c) => isObtenido(c.id));
    if (filtroColeccion === 'no-obtenidos') list = list.filter((c) => !isObtenido(c.id));
    if (filtroColeccion === 'maestria') {
      list = list.filter((c) => (collection.maestrias[c.id] || 0) >= 30);
    }
    return list;
  }, [companions, search, activeLetter, filtroColeccion, isObtenido, collection.maestrias]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);

  const availableLetters = useMemo(() => getAvailableLetters(companions), [companions]);

  const conMaestriaMaxima = useMemo(
    () => companions.filter((c) => (collection.maestrias[c.id] || 0) >= 30).length,
    [companions, collection.maestrias]
  );

  function selectLetter(letter) {
    setActiveLetter(letter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <PageLayout
      total={companions.length}
      obtenidosCount={collection.totalObtenidos}
      subCounterValue={conMaestriaMaxima}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      loading={loading}
      error={error}
      onReload={reload}
    >

      <div className="controls-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          filtroColeccion={filtroColeccion}
          onSetFiltro={setFiltroColeccion}
          placeholder="Buscar compañero... (ej: Carrier, Smeeta Kavat)"
          showMasteryFilter
        />
      </div>

      <AlphabetNav
        availableLetters={availableLetters}
        activeLetter={activeLetter}
        onSelect={selectLetter}
      />

      <main id="top">
        <CatalogSections
          loading={loading}
          error={error}
          onRetry={reload}
          emptyMessage="No se encontraron compañeros con ese criterio."
          sections={grouped}
          renderItem={(item) => (
            <CompanionCard
              key={item.uniqueName}
              item={item}
              displayImg={imageUrl(item)}
              obtenido={collection.isObtenido(item.id)}
              onToggleObtenido={collection.toggleObtenido}
              mastery={collection.maestrias[item.id] || 0}
              onMasteryChange={collection.setMaestria}
              onMostrar={(it) => setDetail({ item: it })}
            />
          )}
        />
      </main>

      <CompanionModal
        detail={detail}
        maestria={detail ? collection.maestrias[detail.item.id] || 0 : 0}
        onClose={() => setDetail(null)}
      />
    </PageLayout>
  );
}

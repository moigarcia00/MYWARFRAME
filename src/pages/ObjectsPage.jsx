import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CatalogSections from '../components/CatalogSections';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import AlphabetNav from '../components/AlphabetNav';
import CategoryTabs from '../components/CategoryTabs';
import ObjectCard from '../components/ObjectCard';
import ObjectModal from '../components/ObjectModal';
import { useObjects } from '../hooks/useObjects';
import { useObjectCollection } from '../hooks/useObjectCollection';
import { usePagination } from '../hooks/usePagination';
import { useWarframes } from '../hooks/useWarframes';
import { useWeapons } from '../hooks/useWeapons';
import { useDrops } from '../hooks/useDrops';
import { useRelics } from '../hooks/useRelics';
import { normalize } from '../utils/normalize';
import { groupByLetter, getAvailableLetters } from '../utils/catalog';
import { imageUrl, extractBlueprints } from '../api/objectsApi';
import { objectCategory, OBJECT_CATEGORY_ORDER } from '../data/translations';

export default function ObjectsPage({ activeTab, onSelectTab }) {
  const { objects: apiObjects, loading, error, reload } = useObjects();
  const { warframes } = useWarframes();
  const { weapons } = useWeapons();
  const collection = useObjectCollection();
  const { isObtenido } = collection;

  // Los planos de warframes/armas no vienen sueltos en /items — se sacan
  // de los "components" que ya tienes cargados en esas dos pestañas y se
  // añaden aquí junto al resto de objetos.
  const objects = useMemo(
    () => [...apiObjects, ...extractBlueprints(warframes, weapons)],
    [apiObjects, warframes, weapons]
  );

  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('*');
  const [filtroColeccion, setFiltroColeccion] = useState('todos');
  const [categoria, setCategoria] = useState('Todas');
  const [detail, setDetail] = useState(null);

  // Drops y reliquias solo se piden al abrir un detalle: son datos grandes
  // que no hacen falta para ver el catálogo.
  const detalleAbierto = detail !== null;
  const { index: dropsIndex } = useDrops(detalleAbierto);
  const { relics } = useRelics(detalleAbierto);

  useEffect(() => {
    if (objects.length > 0) {
      collection.pruneOrphans(objects.map((o) => o.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects]);

  const categoryInfo = useMemo(() => {
    const counts = new Map();
    objects.forEach((o) => {
      const cat = objectCategory(o);
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    const known = OBJECT_CATEGORY_ORDER.filter((c) => counts.has(c));
    const rest = [...counts.keys()].filter((c) => !OBJECT_CATEGORY_ORDER.includes(c)).sort();
    const list = [...known, ...rest].map((key) => ({ key, label: key, count: counts.get(key) }));
    return { list, total: objects.length };
  }, [objects]);

  const filtered = useMemo(() => {
    let list = objects;
    if (categoria !== 'Todas') list = list.filter((o) => objectCategory(o) === categoria);
    const term = normalize(search);
    if (term) list = list.filter((o) => normalize(o.name).includes(term));
    if (activeLetter !== '*') {
      list = list.filter((o) => normalize(o.name)[0]?.toUpperCase() === activeLetter);
    }
    if (filtroColeccion === 'obtenidos') list = list.filter((o) => isObtenido(o.id));
    if (filtroColeccion === 'no-obtenidos') list = list.filter((o) => !isObtenido(o.id));
    return list;
  }, [objects, categoria, search, activeLetter, filtroColeccion, isObtenido]);

  const { page: currentPage, totalPages, pageItems, goToPage, resetPage } = usePagination(filtered);
  const grouped = useMemo(() => groupByLetter(pageItems), [pageItems]);

  const availableLetters = useMemo(() => {
    const base = categoria === 'Todas' ? objects : objects.filter((o) => objectCategory(o) === categoria);
    return getAvailableLetters(base);
  }, [objects, categoria]);

  function selectLetter(letter) {
    setActiveLetter(letter);
    resetPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectCategoria(cat) {
    setCategoria(cat);
    setActiveLetter('*');
    resetPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeSearch(value) {
    setSearch(value);
    resetPage();
  }

  function changeFiltro(value) {
    setFiltroColeccion(value);
    resetPage();
  }

  return (
    <PageLayout
      total={objects.length}
      obtenidosCount={collection.totalObtenidos}
      subCounterLabel="COPIAS TOTALES"
      subCounterValue={collection.totalCopias}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      loading={loading}
      error={error}
      onReload={reload}
    >

      <div className="controls-wrap">
        <SearchBar
          value={search}
          onChange={changeSearch}
          filtroColeccion={filtroColeccion}
          onSetFiltro={changeFiltro}
          placeholder="Buscar objeto... (ej: Neurodes, Orokin Cell)"
        />
      </div>

      {!loading && !error && <CategoryTabs categories={categoryInfo} active={categoria} onSelect={selectCategoria} />}

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
          emptyMessage="No se encontraron objetos con ese criterio."
          sections={grouped}
          renderItem={(item) => (
            <ObjectCard
              key={item.uniqueName}
              item={item}
              displayImg={imageUrl(item)}
              cantidad={collection.getCantidad(item.id)}
              onCantidadChange={collection.setCantidad}
              onMostrar={setDetail}
            />
          )}
        />

        {!loading && !error && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        )}
      </main>

      <ObjectModal
        detail={detail}
        cantidad={detail ? collection.getCantidad(detail.id) : 0}
        onCantidadChange={collection.setCantidad}
        dropsIndex={dropsIndex}
        relics={relics}
        onClose={() => setDetail(null)}
      />
    </PageLayout>
  );
}

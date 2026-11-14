import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CatalogSections from '../components/CatalogSections';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import AlphabetNav from '../components/AlphabetNav';
import CategoryTabs from '../components/CategoryTabs';
import ModCard from '../components/ModCard';
import ModModal from '../components/ModModal';
import RivenCard from '../components/RivenCard';
import RivenForm from '../components/RivenForm';
import { useMods } from '../hooks/useMods';
import { usePagination } from '../hooks/usePagination';
import { useModCollection } from '../hooks/useModCollection';
import { useRivens } from '../hooks/useRivens';
import { useWeapons } from '../hooks/useWeapons';
import { useWarframes } from '../hooks/useWarframes';
import { normalize } from '../utils/normalize';
import { groupByLetter, getAvailableLetters } from '../utils/catalog';
import { imageUrl } from '../api/modsApi';
import { modCategories, MOD_CATEGORY_ORDER } from '../data/translations';

const RIVEN_TAB = 'Agrietados';
// Estas dos se fuerzan a aparecer siempre, aunque de momento cuenten 0 —
// así se pueden comprobar visualmente si la detección por palabras clave
// está encontrando algo o no, en vez de desaparecer sin más si falla.
const ALWAYS_SHOW_TABS = new Set(['Railjack', 'Exilus', RIVEN_TAB]);

export default function ModsPage({ activeTab, onSelectTab }) {
  const { mods, loading, error, reload } = useMods();
  const collection = useModCollection();
  const { isObtenido } = collection;
  const { rivens, addRiven, updateRiven, deleteRiven } = useRivens();
  const { weapons } = useWeapons(); // para el autocompletado de "arma" en el formulario de riven
  const { warframes } = useWarframes(); // para detectar mods de "Habilidades" por compatName

  const warframeNames = useMemo(() => {
    const set = new Set();
    warframes.forEach((w) => {
      set.add(normalize(w.name));
      set.add(normalize(w.name.replace(/\s*prime$/i, '').trim()));
    });
    return set;
  }, [warframes]);

  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('*');
  const [filtroColeccion, setFiltroColeccion] = useState('todos');
  const [categoria, setCategoria] = useState('Todas');
  const [detail, setDetail] = useState(null);
  const [rivenEditing, setRivenEditing] = useState(null); // null = no form, {} = nuevo, {...} = editar

  useEffect(() => {
    if (mods.length > 0) {
      collection.pruneOrphans(mods.map((m) => m.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mods]);

  const categoriesByMod = useMemo(() => {
    const map = new Map();
    mods.forEach((m) => map.set(m.id, modCategories(m, warframeNames)));
    return map;
  }, [mods, warframeNames]);

  const categoryInfo = useMemo(() => {
    const counts = new Map();
    mods.forEach((m) => {
      categoriesByMod.get(m.id).forEach((cat) => {
        counts.set(cat, (counts.get(cat) || 0) + 1);
      });
    });
    const known = MOD_CATEGORY_ORDER.filter((c) => counts.has(c) || ALWAYS_SHOW_TABS.has(c));
    const rest = [...counts.keys()].filter((c) => !MOD_CATEGORY_ORDER.includes(c)).sort();
    const list = [...known, ...rest].map((key) => ({
      key,
      label: key,
      count: key === RIVEN_TAB ? rivens.length : counts.get(key) || 0
    }));
    return { list, total: mods.length };
  }, [mods, rivens, categoriesByMod]);

  const filtered = useMemo(() => {
    let list = mods;
    if (categoria !== 'Todas' && categoria !== RIVEN_TAB) {
      list = list.filter((m) => categoriesByMod.get(m.id).includes(categoria));
    }
    const term = normalize(search);
    if (term) list = list.filter((m) => normalize(m.name).includes(term));
    if (activeLetter !== '*') {
      list = list.filter((m) => normalize(m.name)[0]?.toUpperCase() === activeLetter);
    }
    if (filtroColeccion === 'obtenidos') list = list.filter((m) => isObtenido(m.id));
    if (filtroColeccion === 'no-obtenidos') list = list.filter((m) => !isObtenido(m.id));
    return list;
  }, [mods, categoria, search, activeLetter, filtroColeccion, isObtenido, categoriesByMod]);

  const { page: currentPage, totalPages, pageItems, goToPage, resetPage } = usePagination(filtered);
  const grouped = useMemo(() => groupByLetter(pageItems), [pageItems]);

  const availableLetters = useMemo(() => {
    const base =
      categoria === 'Todas' || categoria === RIVEN_TAB
        ? mods
        : mods.filter((m) => categoriesByMod.get(m.id).includes(categoria));
    return getAvailableLetters(base);
  }, [mods, categoria, categoriesByMod]);

  const filteredRivens = useMemo(() => {
    const term = normalize(search);
    if (!term) return rivens;
    return rivens.filter(
      (r) => normalize(r.nombre).includes(term) || normalize(r.arma).includes(term)
    );
  }, [rivens, search]);

  const rivensPagination = usePagination(filteredRivens);

  const weaponNames = useMemo(() => weapons.map((w) => w.name).sort(), [weapons]);

  function selectLetter(letter) {
    setActiveLetter(letter);
    resetPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectCategoria(cat) {
    setCategoria(cat);
    setActiveLetter('*');
    setSearch('');
    resetPage();
    rivensPagination.resetPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeSearch(value) {
    setSearch(value);
    resetPage();
    rivensPagination.resetPage();
  }

  function changeFiltro(value) {
    setFiltroColeccion(value);
    resetPage();
  }

  function saveRiven(data) {
    if (rivenEditing?.id) updateRiven(rivenEditing.id, data);
    else addRiven(data);
    setRivenEditing(null);
  }

  const enAgrietados = categoria === RIVEN_TAB;

  return (
    <PageLayout
      total={mods.length}
      obtenidosCount={collection.totalObtenidos}
      subCounterLabel="COPIAS TOTALES"
      subCounterValue={collection.totalCopias}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      loading={loading}
      error={error}
      onReload={reload}
      showFooter={!enAgrietados}
    >

      <div className="controls-wrap">
        {enAgrietados ? (
          <div className="search-row">
            <div className="search-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre o arma..."
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
              />
            </div>
            <button type="button" className="filter-obtenidos active" onClick={() => setRivenEditing({})}>
              + Añadir agrietado
            </button>
          </div>
        ) : (
          <SearchBar
            value={search}
            onChange={changeSearch}
            filtroColeccion={filtroColeccion}
            onSetFiltro={changeFiltro}
            placeholder="Buscar mod... (ej: Serration, Vital Sense)"
          />
        )}
      </div>

      {!loading && !error && (
        <CategoryTabs categories={categoryInfo} active={categoria} onSelect={selectCategoria} />
      )}

      {!enAgrietados && (
        <AlphabetNav
          availableLetters={availableLetters}
          activeLetter={activeLetter}
          onSelect={selectLetter}
        />
      )}

      <main id="top">
        {enAgrietados ? (
          <section className="riven-section">
            <p className="riven-intro">
              La API de Warframe no da los agrietados de cada jugador (se generan al azar y son
              propios de tu cuenta) — así que esta sección es tuya: añade los que tengas a mano,
              con sus estadísticas, y se guardan en este navegador.
            </p>

            {filteredRivens.length === 0 && (
              <div className="state-msg">
                Todavía no has añadido ningún agrietado. Usa el botón "+ Añadir agrietado" de
                arriba.
              </div>
            )}

            <div className="cards-grid riven-grid">
              {rivensPagination.pageItems.map((r) => (
                <RivenCard
                  key={r.id}
                  riven={r}
                  onEdit={setRivenEditing}
                  onDelete={deleteRiven}
                />
              ))}
            </div>

            <Pagination
              page={rivensPagination.page}
              totalPages={rivensPagination.totalPages}
              onChange={rivensPagination.goToPage}
            />
          </section>
        ) : (
          <CatalogSections
            loading={loading}
            error={error}
            onRetry={reload}
            emptyMessage="No se encontraron mods con ese criterio."
            sections={grouped}
            renderItem={(item) => (
              <ModCard
                key={item.uniqueName}
                item={item}
                displayImg={imageUrl(item)}
                cantidad={collection.getCantidad(item.id)}
                onCantidadChange={collection.setCantidad}
                onMostrar={setDetail}
              />
            )}
          />
        )}

        {!enAgrietados && !loading && !error && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        )}
      </main>

      <ModModal
        detail={detail}
        cantidad={detail ? collection.getCantidad(detail.id) : 0}
        onCantidadChange={collection.setCantidad}
        warframeNames={warframeNames}
        onClose={() => setDetail(null)}
      />

      {rivenEditing !== null && (
        <div className="modal-overlay visible" onClick={() => setRivenEditing(null)}>
          <div className="modal-wrap riven-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRivenEditing(null)} aria-label="Cerrar">
              ×
            </button>
            <div className="modal-title">
              {rivenEditing.id ? 'Editar agrietado' : 'Nuevo agrietado'}
            </div>
            <RivenForm
              initial={rivenEditing.id ? rivenEditing : null}
              weaponNames={weaponNames}
              onSave={saveRiven}
              onCancel={() => setRivenEditing(null)}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CatalogSections from '../components/CatalogSections';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import AlphabetNav from '../components/AlphabetNav';
import CategoryTabs from '../components/CategoryTabs';
import WeaponCard from '../components/WeaponCard';
import WeaponModal from '../components/WeaponModal';
import PickerModal from '../components/PickerModal';
import { useWeapons } from '../hooks/useWeapons';
import { useWeaponCollection } from '../hooks/useWeaponCollection';
import { usePagination } from '../hooks/usePagination';
import { normalize } from '../utils/normalize';
import { groupByLetter, getAvailableLetters } from '../utils/catalog';
import { imageUrl } from '../api/weaponsApi';
import { SKINS } from '../data/weaponSkins';
import { categoryLabel, WEAPON_CATEGORY_ORDER, maxMasteryFor, displayWeaponName } from '../data/translations';

const DEFAULT_LIST = [{ nombre: 'Original', img: null, desc: '' }];

function getSkinList(item) {
  return SKINS[item.name] || DEFAULT_LIST;
}

function findOption(list, nombre) {
  return list.find((o) => o.nombre === nombre) || list[0];
}

export default function ArmasPage({ activeTab, onSelectTab }) {
  const { weapons, loading, error, reload } = useWeapons();
  const collection = useWeaponCollection();
  const { isObtenido } = collection;

  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('*');
  const [filtroColeccion, setFiltroColeccion] = useState('todos');
  const [categoria, setCategoria] = useState('Todas');
  const [detail, setDetail] = useState(null);
  const [picker, setPicker] = useState(null);

  useEffect(() => {
    if (weapons.length > 0) {
      collection.pruneOrphans(weapons.map((w) => w.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weapons]);

  // El contador de "maestría máxima" del hook asume tope 30 para todo; las
  // Kuva/Tenet/Coda llegan a 40, así que aquí se recalcula bien por arma.
  const conMaestriaMaxima = useMemo(
    () => weapons.filter((w) => (collection.maestrias[w.id] || 0) >= maxMasteryFor(w)).length,
    [weapons, collection.maestrias]
  );

  const categoryInfo = useMemo(() => {
    const counts = new Map();
    weapons.forEach((w) => {
      counts.set(w.category, (counts.get(w.category) || 0) + 1);
    });
    const known = WEAPON_CATEGORY_ORDER.filter((c) => counts.has(c));
    const rest = [...counts.keys()].filter((c) => !WEAPON_CATEGORY_ORDER.includes(c)).sort();
    const list = [...known, ...rest].map((key) => ({
      key,
      label: categoryLabel(key),
      count: counts.get(key)
    }));
    return { list, total: weapons.length };
  }, [weapons]);

  const filtered = useMemo(() => {
    let list = weapons;
    if (categoria !== 'Todas') list = list.filter((w) => w.category === categoria);
    const term = normalize(search);
    if (term) list = list.filter((w) => normalize(w.name).includes(term));
    if (activeLetter !== '*') {
      list = list.filter((w) => normalize(displayWeaponName(w))[0]?.toUpperCase() === activeLetter);
    }
    if (filtroColeccion === 'obtenidos') list = list.filter((w) => isObtenido(w.id));
    if (filtroColeccion === 'no-obtenidos') list = list.filter((w) => !isObtenido(w.id));
    if (filtroColeccion === 'maestria') {
      list = list.filter((w) => (collection.maestrias[w.id] || 0) >= maxMasteryFor(w));
    }
    // Se ordena por el nombre "limpio" (sin el "<ARCHWING>" que trae la API)
    // para que el orden alfabético sea el que se ve, no el interno.
    return [...list].sort((a, b) =>
      displayWeaponName(a).localeCompare(displayWeaponName(b), 'es')
    );
  }, [weapons, categoria, search, activeLetter, filtroColeccion, isObtenido, collection.maestrias]);

  const { page: currentPage, totalPages, pageItems, goToPage, resetPage } = usePagination(filtered);
  const grouped = useMemo(
    () => groupByLetter(pageItems, displayWeaponName),
    [pageItems]
  );

  const availableLetters = useMemo(() => {
    const base = categoria === 'Todas' ? weapons : weapons.filter((w) => w.category === categoria);
    return getAvailableLetters(base, displayWeaponName);
  }, [weapons, categoria]);

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

  function displayImgFor(item) {
    const skinNombre = collection.skinActiva[item.id] || 'Original';
    const skin = findOption(getSkinList(item), skinNombre);
    return skin.img || imageUrl(item);
  }

  function openMostrar(item) {
    const skinNombre = collection.skinActiva[item.id] || 'Original';
    const skin = findOption(getSkinList(item), skinNombre);
    setDetail({
      item,
      img: skin.img || imageUrl(item),
      skinNombre,
      skinDesc: skin.desc
    });
  }

  function pickerOptionsFor(item) {
    return getSkinList(item).map((opt) =>
      opt.nombre === 'Original' && !opt.img ? { ...opt, img: imageUrl(item) } : opt
    );
  }

  return (
    <PageLayout
      total={weapons.length}
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
          onChange={changeSearch}
          filtroColeccion={filtroColeccion}
          onSetFiltro={changeFiltro}
          placeholder="Buscar arma... (ej: Braton Prime, Nikana)"
          showMasteryFilter
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
          emptyMessage="No se encontraron armas con ese criterio."
          sections={grouped}
          renderItem={(item) => (
            <WeaponCard
              key={item.uniqueName}
              item={item}
              displayImg={displayImgFor(item)}
              obtenido={collection.isObtenido(item.id)}
              onToggleObtenido={collection.toggleObtenido}
              skinNombre={collection.skinActiva[item.id] || 'Original'}
              onOpenSkinPicker={(it) => setPicker({ item: it })}
              mastery={collection.maestrias[item.id] || 0}
              onMasteryChange={collection.setMaestria}
              onMostrar={openMostrar}
            />
          )}
        />

        {!loading && !error && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        )}
      </main>

      <WeaponModal
        detail={detail}
        maestria={detail ? collection.maestrias[detail.item.id] || 0 : 0}
        onClose={() => setDetail(null)}
      />

      {picker && (
        <PickerModal
          title={`Skins — ${displayWeaponName(picker.item)}`}
          icon="🎨"
          isPrime={/prime/i.test(picker.item.name)}
          options={pickerOptionsFor(picker.item)}
          active={collection.skinActiva[picker.item.id] || 'Original'}
          isOwned={(nombre) => collection.isSkinObtenida(picker.item.id, nombre)}
          onToggleOwned={(nombre) => collection.toggleSkinObtenida(picker.item.id, nombre)}
          onSelect={(nombre) => collection.setSkin(picker.item.id, nombre)}
          onClose={() => setPicker(null)}
        />
      )}
    </PageLayout>
  );
}

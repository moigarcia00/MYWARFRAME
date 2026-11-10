import { useEffect, useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CatalogSections from '../components/CatalogSections';
import SearchBar from '../components/SearchBar';
import AlphabetNav from '../components/AlphabetNav';
import WarframeCard from '../components/WarframeCard';
import WarframeModal from '../components/WarframeModal';
import PickerModal from '../components/PickerModal';
import { useWarframes } from '../hooks/useWarframes';
import { useCollection } from '../hooks/useCollection';
import { useHelminthLog } from '../hooks/useHelminthLog';
import { normalize } from '../utils/normalize';
import { groupByLetter, getAvailableLetters } from '../utils/catalog';
import { imageUrl } from '../api/warframeApi';
import { SKINS } from '../data/skins';
import { HELMETS } from '../data/helmets';
import { maxMasteryFor } from '../data/translations';

const DEFAULT_LIST = [{ nombre: 'Original', img: null, desc: '' }];

function getSkinList(item) {
  return SKINS[item.name] || DEFAULT_LIST;
}

function getHelmetList(item) {
  return HELMETS[item.name] || DEFAULT_LIST;
}

function findOption(list, nombre) {
  return list.find((o) => o.nombre === nombre) || list[0];
}

export default function WarframesPage({ activeTab, onSelectTab }) {
  const { warframes, loading, error, reload } = useWarframes();
  const collection = useCollection();
  const { isObtenido } = collection;
  const helminthLog = useHelminthLog();
  const { isHelminto } = helminthLog;

  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('*');
  const [filtroColeccion, setFiltroColeccion] = useState('todos'); // 'todos' | 'obtenidos' | 'no-obtenidos'
  const [detail, setDetail] = useState(null);
  const [picker, setPicker] = useState(null); // { type: 'skin' | 'helmet', item }

  // Cuando llegan los datos de la API, limpia de la colección guardada
  // cualquier id que ya no exista en el catálogo actual (p.ej. "Helminth",
  // que se excluyó por no ser un warframe jugable). Arregla el contador
  // "1/120" fantasma que no correspondía a ninguna tarjeta visible.
  useEffect(() => {
    if (warframes.length > 0) {
      collection.pruneOrphans(warframes.map((w) => w.id));
      helminthLog.pruneOrphans(warframes.map((w) => w.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warframes]);

  // El contador de "maestría máxima" del hook asume tope 30 para todo; los
  // Necramechs llegan a 40, así que aquí se recalcula bien por warframe.
  const conMaestriaMaxima = useMemo(
    () => warframes.filter((w) => (collection.maestrias[w.id] || 0) >= maxMasteryFor(w)).length,
    [warframes, collection.maestrias]
  );

  const filtered = useMemo(() => {
    let list = warframes;
    const term = normalize(search);
    if (term) list = list.filter((w) => normalize(w.name).includes(term));
    if (activeLetter !== '*') {
      list = list.filter((w) => normalize(w.name)[0]?.toUpperCase() === activeLetter);
    }
    if (filtroColeccion === 'obtenidos') list = list.filter((w) => isObtenido(w.id));
    if (filtroColeccion === 'no-obtenidos') list = list.filter((w) => !isObtenido(w.id));
    if (filtroColeccion === 'maestria') {
      list = list.filter((w) => (collection.maestrias[w.id] || 0) >= maxMasteryFor(w));
    }
    if (filtroColeccion === 'helminto') list = list.filter((w) => isHelminto(w.id));
    return list;
  }, [
    warframes,
    search,
    activeLetter,
    filtroColeccion,
    isObtenido,
    collection.maestrias,
    isHelminto
  ]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);

  // El índice alfabético siempre refleja TODAS las letras disponibles
  // (no solo las del resultado filtrado actual), para poder saltar entre ellas.
  const availableLetters = useMemo(() => getAvailableLetters(warframes), [warframes]);

  function selectLetter(letter) {
    setActiveLetter(letter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function displayImgFor(item) {
    const skinNombre = collection.skinActiva[item.id] || 'Original';
    const skin = findOption(getSkinList(item), skinNombre);
    return skin.img || imageUrl(item);
  }

  function openMostrar(item) {
    const skinNombre = collection.skinActiva[item.id] || 'Original';
    const skin = findOption(getSkinList(item), skinNombre);
    const helmetNombre = collection.helmetActivo[item.id] || 'Original';
    setDetail({
      item,
      img: skin.img || imageUrl(item),
      skinNombre,
      skinDesc: skin.desc,
      helmetNombre
    });
  }

  function pickerOptionsFor(type, item) {
    const list = type === 'skin' ? getSkinList(item) : getHelmetList(item);
    // La opción "Original" muestra siempre la imagen base de la API en el
    // selector, aunque su campo img sea null (se rellena aquí, no en el dato).
    return list.map((opt) =>
      opt.nombre === 'Original' && !opt.img ? { ...opt, img: imageUrl(item) } : opt
    );
  }

  return (
    <PageLayout
      total={warframes.length}
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
          placeholder="Buscar warframe... (ej: Excalibur, Volt Prime)"
          showMasteryFilter
          showHelminthFilter
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
          emptyMessage="No se encontraron warframes con ese criterio."
          sections={grouped}
          renderItem={(item) => (
            <WarframeCard
              key={item.uniqueName}
              item={item}
              displayImg={displayImgFor(item)}
              obtenido={collection.isObtenido(item.id)}
              onToggleObtenido={collection.toggleObtenido}
              skinNombre={collection.skinActiva[item.id] || 'Original'}
              onOpenSkinPicker={(it) => setPicker({ type: 'skin', item: it })}
              helmetNombre={collection.helmetActivo[item.id] || 'Original'}
              onOpenHelmetPicker={(it) => setPicker({ type: 'helmet', item: it })}
              mastery={collection.maestrias[item.id] || 0}
              onMasteryChange={collection.setMaestria}
              helminto={helminthLog.isHelminto(item.id)}
              onToggleHelminto={helminthLog.toggleHelminto}
              onMostrar={openMostrar}
            />
          )}
        />
      </main>

      <WarframeModal
        detail={detail}
        maestria={detail ? collection.maestrias[detail.item.id] || 0 : 0}
        onClose={() => setDetail(null)}
      />

      {picker && (
        <PickerModal
          title={picker.type === 'skin' ? `Skins — ${picker.item.name}` : `Helmets — ${picker.item.name}`}
          icon={picker.type === 'skin' ? '🎨' : '⛑'}
          isPrime={/prime/i.test(picker.item.name)}
          options={pickerOptionsFor(picker.type, picker.item)}
          active={
            picker.type === 'skin'
              ? collection.skinActiva[picker.item.id] || 'Original'
              : collection.helmetActivo[picker.item.id] || 'Original'
          }
          isOwned={(nombre) =>
            picker.type === 'skin'
              ? collection.isSkinObtenida(picker.item.id, nombre)
              : collection.isHelmetObtenido(picker.item.id, nombre)
          }
          onToggleOwned={(nombre) =>
            picker.type === 'skin'
              ? collection.toggleSkinObtenida(picker.item.id, nombre)
              : collection.toggleHelmetObtenido(picker.item.id, nombre)
          }
          onSelect={(nombre) =>
            picker.type === 'skin'
              ? collection.setSkin(picker.item.id, nombre)
              : collection.setHelmet(picker.item.id, nombre)
          }
          onClose={() => setPicker(null)}
        />
      )}
    </PageLayout>
  );
}

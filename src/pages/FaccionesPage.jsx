import { useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CategoryTabs from '../components/CategoryTabs';
import EnemyCard from '../components/EnemyCard';
import EnemyForm from '../components/EnemyForm';
import EnemyModal from '../components/EnemyModal';
import SearchBar from '../components/SearchBar';
import { useFactions } from '../hooks/useFactions';
import { useEnemies } from '../hooks/useEnemies';
import { useEnemyLog } from '../hooks/useEnemyLog';
import { useScannedEnemies } from '../hooks/useScannedEnemies';
import { normalize } from '../utils/normalize';

export default function FaccionesPage({ activeTab, onSelectTab }) {
  const { factions, loading: factionsLoading } = useFactions();
  const { enemies: apiEnemies, loading: enemiesLoading, error: enemiesError } = useEnemies();
  const { enemies: manualEnemies, addEnemy, updateEnemy, deleteEnemy, toggleEscaneado } =
    useEnemyLog();
  const { isScanned, toggleScanned } = useScannedEnemies();

  const [faccion, setFaccion] = useState('Todas');
  const [search, setSearch] = useState('');
  const [filtroEscaneo, setFiltroEscaneo] = useState('todos');
  const [editing, setEditing] = useState(null); // null = sin formulario, {} = nuevo, {...} = editar
  const [detailId, setDetailId] = useState(null);

  // Los enemigos de la API y los añadidos a mano viven en sitios distintos,
  // pero se muestran juntos. Los de la API solo guardan su estado de
  // escaneado; los manuales guardan notas e imagen.
  const allEnemies = useMemo(() => {
    const auto = apiEnemies.map((e) => ({ ...e, escaneado: isScanned(e.id), manual: false }));
    const manual = manualEnemies.map((e) => ({ ...e, manual: true }));
    return [...auto, ...manual];
  }, [apiEnemies, manualEnemies, isScanned]);

  // Orden de facciones: primero las fijas de la app y después las que
  // aparezcan solo en los datos (por ejemplo "Otros").
  const factionOrder = useMemo(() => {
    const known = factions.map((f) => f.name);
    const extra = [...new Set(allEnemies.map((e) => e.faccion || 'Sin facción'))]
      .filter((name) => !known.includes(name))
      .sort((a, b) => a.localeCompare(b, 'es'));
    return [...known, ...extra];
  }, [factions, allEnemies]);

  const factionRank = useMemo(
    () => new Map(factionOrder.map((name, index) => [name, index])),
    [factionOrder]
  );

  const sortedEnemies = useMemo(() => {
    return [...allEnemies].sort((a, b) => {
      const fa = a.faccion || 'Sin facción';
      const fb = b.faccion || 'Sin facción';
      const ra = factionRank.get(fa) ?? Number.MAX_SAFE_INTEGER;
      const rb = factionRank.get(fb) ?? Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
  }, [allEnemies, factionRank]);

  const factionInfo = useMemo(() => {
    const counts = new Map();
    allEnemies.forEach((e) => {
      const key = e.faccion || 'Sin facción';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const list = factionOrder.map((key) => ({
      key,
      label: key,
      count: counts.get(key) || 0
    }));
    return { list, total: allEnemies.length };
  }, [allEnemies, factionOrder]);

  const filtered = useMemo(() => {
    let list = sortedEnemies;
    if (faccion !== 'Todas') list = list.filter((e) => (e.faccion || 'Sin facción') === faccion);
    if (filtroEscaneo === 'escaneados') list = list.filter((e) => e.escaneado);
    else if (filtroEscaneo === 'no-escaneados') list = list.filter((e) => !e.escaneado);
    const term = normalize(search);
    if (term) {
      list = list.filter((e) => normalize(e.nombre).includes(term) || normalize(e.faccion).includes(term));
    }
    return list;
  }, [sortedEnemies, faccion, filtroEscaneo, search]);

  const escaneados = allEnemies.filter((e) => e.escaneado).length;
  const currentFactionDesc = factions.find((f) => f.name === faccion)?.description;
  const detail = useMemo(
    () => allEnemies.find((e) => e.id === detailId) || null,
    [allEnemies, detailId]
  );

  function saveEnemy(data) {
    if (editing?.id) updateEnemy(editing.id, data);
    else addEnemy(data);
    setEditing(null);
  }

  function toggleEnemy(enemy) {
    if (enemy.manual) toggleEscaneado(enemy.id);
    else toggleScanned(enemy.id);
  }

  return (
    <PageLayout
      total={allEnemies.length}
      obtenidosCount={escaneados}
      subCounterLabel="ESCANEADOS"
      subCounterValue={escaneados}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      loading={factionsLoading || enemiesLoading}
      showFooter={false}
    >

      <div className="controls-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          filtroColeccion={filtroEscaneo}
          onSetFiltro={setFiltroEscaneo}
          placeholder="Buscar enemigo o facción..."
          obtainedValue="escaneados"
          notObtainedValue="no-escaneados"
          obtainedLabel="✓ Solo escaneados"
          notObtainedLabel="○ Solo no escaneados"
          obtainedTitle="Mostrar solo los enemigos escaneados"
          notObtainedTitle="Mostrar solo los enemigos sin escanear"
        >
          <button
            type="button"
            className="filter-add"
            onClick={() => setEditing({ faccion: faccion !== 'Todas' ? faccion : '' })}
          >
            + Añadir enemigo
          </button>
        </SearchBar>
      </div>

      <CategoryTabs categories={factionInfo} active={faccion} onSelect={setFaccion} />

      <main id="top">
        <section className="riven-section">
          <p className="riven-intro">
            Los enemigos se cargan automáticamente desde la API y se ordenan por facción. Las
            facciones claras (Grineer, Corpus, Infestación, Orokin, Consciente y Stalker) tienen su
            propia pestaña; el resto se agrupa en Otros. Los enemigos que añadas a mano, con sus
            notas e imagen, se guardan en este navegador.
            {!factionsLoading && currentFactionDesc ? ` ${currentFactionDesc}` : ''}
          </p>

          {enemiesError && (
            <div className="state-msg">
              No se pudieron cargar los enemigos de la API. Se muestran solo los que hayas añadido
              a mano.
            </div>
          )}

          {filtered.length === 0 && (
            <div className="state-msg">
              {allEnemies.length === 0
                ? 'Todavía no hay enemigos que mostrar. Usa el botón "+ Añadir enemigo" de arriba.'
                : 'No se encontraron enemigos con ese criterio.'}
            </div>
          )}

          <div className="cards-grid">
            {filtered.map((e) => (
              <EnemyCard
                key={e.id}
                enemy={e}
                onToggle={toggleEnemy}
                onMostrar={(enemy) => setDetailId(enemy.id)}
                onEdit={setEditing}
                onDelete={deleteEnemy}
              />
            ))}
          </div>
        </section>
      </main>

      <EnemyModal enemy={detail} onToggle={toggleEnemy} onClose={() => setDetailId(null)} />

      {editing !== null && (
        <div className="modal-overlay visible" onClick={() => setEditing(null)}>
          <div className="modal-wrap riven-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditing(null)} aria-label="Cerrar">
              ×
            </button>
            <div className="modal-title">{editing.id ? 'Editar enemigo' : 'Nuevo enemigo'}</div>
            <EnemyForm
              initial={editing.id ? editing : null}
              factions={factions}
              defaultFaccion={editing.faccion}
              onSave={saveEnemy}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
}

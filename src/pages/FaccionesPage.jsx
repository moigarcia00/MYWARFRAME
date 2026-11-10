import { useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import CategoryTabs from '../components/CategoryTabs';
import EnemyCard from '../components/EnemyCard';
import EnemyForm from '../components/EnemyForm';
import { useFactions } from '../hooks/useFactions';
import { useEnemyLog } from '../hooks/useEnemyLog';
import { normalize } from '../utils/normalize';

export default function FaccionesPage({ activeTab, onSelectTab }) {
  const { factions, loading } = useFactions();
  const { enemies, addEnemy, updateEnemy, deleteEnemy, toggleEscaneado } = useEnemyLog();

  const [faccion, setFaccion] = useState('Todas');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null = sin formulario, {} = nuevo, {...} = editar

  const factionInfo = useMemo(() => {
    const counts = new Map();
    enemies.forEach((e) => {
      const key = e.faccion || 'Sin facción';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const known = factions.map((f) => f.name);
    const rest = [...counts.keys()].filter((n) => !known.includes(n)).sort();
    const list = [...known, ...rest].map((key) => ({ key, label: key, count: counts.get(key) || 0 }));
    return { list, total: enemies.length };
  }, [enemies, factions]);

  const filtered = useMemo(() => {
    let list = enemies;
    if (faccion !== 'Todas') list = list.filter((e) => (e.faccion || 'Sin facción') === faccion);
    const term = normalize(search);
    if (term) {
      list = list.filter((e) => normalize(e.nombre).includes(term) || normalize(e.faccion).includes(term));
    }
    return list;
  }, [enemies, faccion, search]);

  const escaneados = enemies.filter((e) => e.escaneado).length;
  const currentFactionDesc = factions.find((f) => f.name === faccion)?.description;

  function saveEnemy(data) {
    if (editing?.id) updateEnemy(editing.id, data);
    else addEnemy(data);
    setEditing(null);
  }

  return (
    <PageLayout
      total={enemies.length}
      obtenidosCount={escaneados}
      subCounterLabel="ESCANEADOS"
      subCounterValue={escaneados}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      loading={loading}
      showFooter={false}
    >

      <div className="controls-wrap">
        <div className="search-row">
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar enemigo o facción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="filter-obtenidos active"
            onClick={() => setEditing({ faccion: faccion !== 'Todas' ? faccion : '' })}
          >
            + Añadir enemigo
          </button>
        </div>
      </div>

      <CategoryTabs categories={factionInfo} active={faccion} onSelect={setFaccion} />

      <main id="top">
        <section className="riven-section">
          <p className="riven-intro">
            La API no tiene un catálogo de enemigos individuales del Códice (Lancer, Napalm,
            Bursa, Ancestrales...) — solo da las facciones en general, así que este registro es
            tuyo: añade los enemigos que quieras seguir, márcalos como escaneados, y se guardan en
            este navegador.
            {!loading && currentFactionDesc ? ` ${currentFactionDesc}` : ''}
          </p>

          {filtered.length === 0 && (
            <div className="state-msg">
              {enemies.length === 0
                ? 'Todavía no has añadido ningún enemigo. Usa el botón "+ Añadir enemigo" de arriba.'
                : 'No se encontraron enemigos con ese criterio.'}
            </div>
          )}

          <div className="cards-grid riven-grid">
            {filtered.map((e) => (
              <EnemyCard
                key={e.id}
                enemy={e}
                onToggle={toggleEscaneado}
                onEdit={setEditing}
                onDelete={deleteEnemy}
              />
            ))}
          </div>
        </section>
      </main>

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

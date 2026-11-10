import { useState } from 'react';
import BackupModal from './BackupModal';

const TABS = [
  { key: 'warframes', label: 'Warframes', icon: '◯', ready: true },
  { key: 'armas', label: 'Armas', icon: '⚔', ready: true },
  { key: 'mods', label: 'Mods', icon: '◆', ready: true },
  { key: 'reliquias', label: 'Reliquias', icon: '◈', ready: true },
  { key: 'companeros', label: 'Compañeros', icon: '🐾', ready: true },
  { key: 'objetos', label: 'Objetos', icon: '▣', ready: true },
  { key: 'facciones', label: 'Facciones', icon: '☠', ready: true }
];

const SUBTITLES = {
  warframes: 'Colección de Warframes',
  armas: 'Colección de Armas',
  mods: 'Colección de Mods',
  reliquias: 'Colección de Reliquias',
  companeros: 'Colección de Compañeros',
  objetos: 'Colección de Objetos',
  facciones: 'Registro de Facciones y Enemigos'
};

export default function Header({
  total,
  obtenidosCount,
  subCounterLabel = 'CON MAESTRÍA MÁXIMA',
  subCounterValue = 0,
  activeTab,
  onSelectTab
}) {
  const [showBackup, setShowBackup] = useState(false);

  return (
    <header>
      <div className="header-eyebrow">Base de datos del Origen del Sistema</div>
      <h1>MYWARFRAME</h1>
      <div className="subtitle">{SUBTITLES[activeTab] || 'Colección'}</div>

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''} ${
              !tab.ready ? 'tab-btn-disabled' : ''
            }`}
            disabled={!tab.ready}
            title={!tab.ready ? 'Próximamente' : undefined}
            onClick={() => tab.ready && onSelectTab?.(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="header-counter-row">
        <div id="contador">
          {obtenidosCount} / {total} OBTENIDOS · {subCounterValue} {subCounterLabel}
        </div>
        <button
          type="button"
          className="backup-trigger"
          onClick={() => setShowBackup(true)}
          title="Copia de seguridad de tu colección"
        >
          💾
        </button>
      </div>

      {showBackup && <BackupModal onClose={() => setShowBackup(false)} />}
    </header>
  );
}

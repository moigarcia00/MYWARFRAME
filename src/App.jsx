import { useState } from 'react';
import Starfield from './components/Starfield';
import WarframesPage from './pages/WarframesPage';
import ArmasPage from './pages/ArmasPage';
import ModsPage from './pages/ModsPage';
import ReliquiasPage from './pages/ReliquiasPage';
import CompanionsPage from './pages/CompanionsPage';
import ObjectsPage from './pages/ObjectsPage';
import FaccionesPage from './pages/FaccionesPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('warframes');

  return (
    <>
      <Starfield />
      {activeTab === 'warframes' && (
        <WarframesPage activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      {activeTab === 'armas' && <ArmasPage activeTab={activeTab} onSelectTab={setActiveTab} />}
      {activeTab === 'mods' && <ModsPage activeTab={activeTab} onSelectTab={setActiveTab} />}
      {activeTab === 'reliquias' && (
        <ReliquiasPage activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      {activeTab === 'companeros' && (
        <CompanionsPage activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      {activeTab === 'objetos' && <ObjectsPage activeTab={activeTab} onSelectTab={setActiveTab} />}
      {activeTab === 'facciones' && (
        <FaccionesPage activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </>
  );
}

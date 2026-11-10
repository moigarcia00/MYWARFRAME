// ══════════════════════════════════════════════════════════
// Facciones — subcatálogos de la pestaña Facciones.
//
// La API no tiene un catálogo de enemigos individuales escaneables (los
// Lancer, Butcher, Napalm, Moa, Ancestrales, etc. del Códice), ni una
// lista de facciones fiable y verificada en vivo — por eso esta lista
// es fija, con las 12 facciones que se usan como subcatálogo en la
// pestaña Facciones, cada una con su propio registro manual de
// enemigos (ver useEnemyLog.js), igual que se hizo con los Agrietados.
// ══════════════════════════════════════════════════════════

export const FACTIONS = [
  { key: 'grineer', name: 'Grineer', description: '' },
  { key: 'corpus', name: 'Corpus', description: '' },
  { key: 'infestacion', name: 'Infestación', description: '' },
  { key: 'sin-afiliacion', name: 'Sin Afiliación', description: '' },
  { key: 'orokin', name: 'Orokin', description: '' },
  { key: 'consciente', name: 'Consciente', description: '' },
  { key: 'stalker', name: 'Stalker', description: '' },
  { key: 'narmer', name: 'Narmer', description: '' },
  { key: 'murmullo', name: 'El Murmullo', description: '' },
  { key: 'scaldra', name: 'Scaldra', description: '' },
  { key: 'techrot', name: 'Techrot', description: '' },
  { key: 'anarcas', name: 'Anarcas', description: '' }
];

export async function getFactions() {
  return FACTIONS;
}

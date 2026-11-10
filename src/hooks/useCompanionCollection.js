import { createCollectionHook } from './createCollectionHook';
import { STORAGE_KEYS } from '../utils/storageKeys';

// Compañeros no usan skin/helmet, pero la fábrica los necesita en el
// juego de claves — se les da su propio hueco de todos modos (por si
// algún día se quieren trackear armaduras de Kubrow, por ejemplo) sin
// que colisione con warframes/armas.
export const useCompanionCollection = createCollectionHook({
  OBTENIDOS: STORAGE_KEYS.companionObtenidos,
  MAESTRIAS: STORAGE_KEYS.companionMaestrias,
  SKINS: STORAGE_KEYS.companionSkins,
  HELMETS: STORAGE_KEYS.companionArmaduras,
  SKINS_OBTENIDAS: STORAGE_KEYS.companionSkinsObtenidas,
  HELMETS_OBTENIDOS: STORAGE_KEYS.companionArmadurasObtenidas
});

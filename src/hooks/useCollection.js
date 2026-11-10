import { createCollectionHook } from './createCollectionHook';
import { STORAGE_KEYS } from '../utils/storageKeys';

// Mismas claves de localStorage que la versión original — no se tocan,
// para no perder datos ya guardados por quien ya usaba la app.
export const useCollection = createCollectionHook({
  OBTENIDOS: STORAGE_KEYS.warframeObtenidos,
  MAESTRIAS: STORAGE_KEYS.warframeMaestrias,
  SKINS: STORAGE_KEYS.warframeSkins,
  HELMETS: STORAGE_KEYS.warframeHelmetActivo,
  SKINS_OBTENIDAS: STORAGE_KEYS.warframeSkinsObtenidas,
  HELMETS_OBTENIDOS: STORAGE_KEYS.warframeHelmetsObtenidos
});

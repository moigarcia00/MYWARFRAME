import { createCollectionHook } from './createCollectionHook';
import { STORAGE_KEYS } from '../utils/storageKeys';

// Colección independiente para Armas — no comparte claves con la de
// Warframes, así que marcar un arma como obtenida no afecta al contador
// de warframes ni viceversa.
export const useWeaponCollection = createCollectionHook({
  OBTENIDOS: STORAGE_KEYS.armaObtenidas,
  MAESTRIAS: STORAGE_KEYS.armaMaestrias,
  SKINS: STORAGE_KEYS.armaSkins,
  HELMETS: STORAGE_KEYS.armaHelmetsActivo,
  SKINS_OBTENIDAS: STORAGE_KEYS.armaSkinsObtenidas,
  HELMETS_OBTENIDOS: STORAGE_KEYS.armaHelmetsObtenidos
});

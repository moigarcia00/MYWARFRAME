import { createQuantityCollectionHook } from './createQuantityCollectionHook';
import { STORAGE_KEYS } from '../utils/storageKeys';

export const useModCollection = createQuantityCollectionHook({
  CANTIDADES: STORAGE_KEYS.modCantidades
});

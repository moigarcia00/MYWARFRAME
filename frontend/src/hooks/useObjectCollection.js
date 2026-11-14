import { createQuantityCollectionHook } from './createQuantityCollectionHook';
import { STORAGE_KEYS } from '../utils/storageKeys';

export const useObjectCollection = createQuantityCollectionHook({
  CANTIDADES: STORAGE_KEYS.objetoCantidades
});

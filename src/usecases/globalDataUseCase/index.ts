import { GloablDataUseCase, GlobalDataReducers } from './types';
import { createUseCase } from '@/methods/createUseCase';

export const globalDataUseCase = createUseCase((): GloablDataUseCase => {
  const map = new Map();

  return <T>(): GlobalDataReducers<T> => {
    const deleteGlobalData = (key: PropertyKey): void => {
      map.delete(key);
    };

    const getGlobalData = (key: PropertyKey): T => {
      return map.get(key);
    };

    const hasGlobalData = (key: PropertyKey): boolean => {
      return map.has(key);
    };

    const setGlobalData = (key: PropertyKey, data: T): void => {
      map.set(key, data);
    };

    return {
      deleteGlobalData,
      getGlobalData,
      hasGlobalData,
      setGlobalData,
    };
  };
});

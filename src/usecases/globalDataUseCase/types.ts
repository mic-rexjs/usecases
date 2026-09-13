import { Reducers } from '@/types';

export type GlobalDataReducers<T> = Reducers<{
  deleteGlobalData(key: PropertyKey): void;

  getGlobalData(key: PropertyKey): T;

  hasGlobalData(key: PropertyKey): boolean;

  setGlobalData(key: PropertyKey, data: T): void;
}>;

export interface GloablDataUseCase {
  <T>(): GlobalDataReducers<T>;
}

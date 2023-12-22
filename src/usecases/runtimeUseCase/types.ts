import { Reducers } from '@/types';

export type RuntimeReducers = Reducers<{
  generateId(length?: number): string;

  getRuntimeData<T, TKey = PropertyKey>(key: TKey): T;

  setRuntimeData<T, TKey = PropertyKey>(key: TKey, value: T): void;
}>;

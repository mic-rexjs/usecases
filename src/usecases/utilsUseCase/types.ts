import { Reducers } from '@/types';

export interface CreateKeyOptions {
  length?: number;

  prefix?: string;

  postfix?: string;

  timestamp?: number;
}

export interface CreateIdOptions extends CreateKeyOptions {}

export type UtilsReducers = Reducers<{
  createKey(options?: CreateKeyOptions): string;

  createId(options?: CreateIdOptions): string;
}>;

export interface UtilsUseCase {
  (): UtilsReducers;
}

import { CreateEntityFactory } from './types';

export const createEntity = <T>(factory: CreateEntityFactory<T>): T => {
  return factory();
};

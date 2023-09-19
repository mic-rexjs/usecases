import { EntityGenerator, EntityReducers, SetEntityCallback } from '@/types';

export type SettableObjectEntity<T extends object> = Partial<T> | SetEntityCallback<T>;

export type ObjectReducers<T extends object> = EntityReducers<
  T,
  {
    setEntity(entity: T, settableEntity: SettableObjectEntity<T>): EntityGenerator<T, T>;
  }
>;

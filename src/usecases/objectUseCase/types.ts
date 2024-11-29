import { EntityGenerator, EntityReducers, SetEntityCallback } from '@/types';

export type AccessorDescriptors<T> = Partial<Record<keyof T, PropertyDescriptor>>;

export type SettableObjectEntity<T extends object> = Partial<T> | SetEntityCallback<T>;

export type ObjectReducers<T extends object> = EntityReducers<
  T,
  {
    setEntity<S extends T>(entity: S, settableEntity: SettableObjectEntity<S>): EntityGenerator<S, S>;
  }
>;

import { EntityChangeEvent } from '../EntityChangeEvent';

export interface EntityStoreOptions<T> {
  onChange?(e: EntityChangeEvent<T>): void;
}

export interface EntityStoreOptions<T> {
  onChange?(newEntity: T, oldEntity: T): void;
}

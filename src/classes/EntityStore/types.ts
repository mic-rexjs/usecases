export interface EntityWatcher<T> {
  (newEntity: T, oldEntity: T): void;
}

export interface EntityStoreOptions<T> {
  onChange?(newEntity: T, oldEntity: T): void;
}

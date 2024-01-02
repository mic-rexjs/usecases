export interface EntityWatcher<T> {
  (newEntity: T, oldEntity: T): void;
}

export interface EntityWatcher<T> {
  (currentEntity: T, prevEntity: T): void;
}

import { EntityStoreOptions, EntityWatcher } from './types';

export class EntityStore<T> {
  readonly #watchers: EntityWatcher<T>[] = [];

  value: T;

  constructor(initialEntity: T, options: EntityStoreOptions<T> = {}) {
    const { onChange } = options;

    this.value = initialEntity;

    if (!onChange) {
      return;
    }

    this.watch(onChange);
  }

  setValue(value: T): void {
    const { value: oldValue } = this;

    this.value = value;

    if (oldValue === value) {
      return;
    }

    for (const watcher of this.#watchers) {
      watcher(value, oldValue);
    }
  }

  unwatch(watcher: EntityWatcher<T>): void {
    const watchers = this.#watchers;
    const index = watchers.indexOf(watcher);

    if (index === -1) {
      return;
    }

    watchers.splice(index, 1);
  }

  watch(watcher: EntityWatcher<T>): void {
    this.#watchers.push(watcher);
  }
}

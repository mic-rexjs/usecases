import { EntityStoreOptions, EntityWatcher } from './types';

export class EntityStore<T> {
  readonly #watchers: EntityWatcher<T>[] = [];

  value: T;

  watching = true;

  constructor(initialEntity: T, options: EntityStoreOptions<T> = {}) {
    const { onChange } = options;

    this.value = initialEntity;

    if (!onChange) {
      return;
    }

    this.watch(onChange);
  }

  setValue(value: T): void;
  /**
   * @deprecated 已废弃，使用 `store.value = newValue` 代替，将在下个主版本后删除
   */
  setValue(value: T, setOnly: boolean): void;
  setValue(value: T, setOnly?: boolean): void {
    const { value: oldValue, watching } = this;

    if (oldValue === value) {
      return;
    }

    this.value = value;

    if (setOnly || !watching) {
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

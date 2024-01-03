import { EntityWatcher } from './types';

export class EntityStore<T> {
  private value: T;

  private readonly watchers: EntityWatcher<T>[] = [];

  constructor(initialEntity: T, watcher?: EntityWatcher<T>) {
    this.value = initialEntity;

    if (watcher) {
      this.watch(watcher);
    }
  }

  getValue(): T {
    const { value } = this;

    return value;
  }

  resetValue(value: T): void {
    this.value = value;
  }

  setValue(value: T): void {
    const prevValue = this.getValue();

    this.value = value;

    if (prevValue === value) {
      return;
    }

    const { watchers } = this;

    for (const watcher of watchers) {
      watcher(value, prevValue);
    }
  }

  watch(watcher: EntityWatcher<T>): void {
    const { watchers } = this;

    watchers.push(watcher);
  }

  unwatch(watcher: EntityWatcher<T>): void {
    const { watchers } = this;
    const index = watchers.indexOf(watcher);

    if (index === -1) {
      return;
    }

    watchers.splice(index, 1);
  }
}

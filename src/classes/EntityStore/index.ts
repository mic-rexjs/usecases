import { EntityGetter } from '@/types';
import { EntityWatcher } from './types';

export class EntityStore<T> {
  private value: T;

  private readonly getter: EntityGetter<T> | null;

  private readonly watchers: EntityWatcher<T>[] = [];

  constructor(initialEntity: T | EntityGetter<T>, watcher?: EntityWatcher<T>) {
    if (typeof initialEntity === 'function') {
      this.value = null as T;
      this.getter = initialEntity as EntityGetter<T>;
    } else {
      this.value = initialEntity;
      this.getter = null;
    }

    if (watcher) {
      this.watch(watcher);
    }
  }

  getValue(): T {
    const { getter, value } = this;

    if (getter) {
      return getter();
    }

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
    this.watchers.push(watcher);
  }
}

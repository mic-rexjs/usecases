import { EntityChangeEvent } from '../EntityChangeEvent';
import { EntityStoreOptions } from './types';

export class EntityStore<T> extends EventTarget {
  value: T;

  constructor(initialEntity: T, options: EntityStoreOptions<T> = {}) {
    const { onChange } = options;

    super();

    this.value = initialEntity;

    this.addEventListener('change', (e: Event): void => {
      onChange?.(e as EntityChangeEvent<T>);
    });
  }

  setValue(value: T): void {
    const { value: oldValue } = this;

    this.value = value;

    if (oldValue === value) {
      return;
    }

    this.dispatchEvent(new EntityChangeEvent('change', { newEntity: value, oldEntity: oldValue }));
  }
}

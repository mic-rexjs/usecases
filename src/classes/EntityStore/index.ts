import { EntityStoreOptions } from './types';

export class EntityStore<T> {
  value: T;

  private readonly options: EntityStoreOptions<T>;

  constructor(initialEntity: T, options: EntityStoreOptions<T> = {}) {
    this.value = initialEntity;
    this.options = options;
  }

  setValue(value: T): void {
    const { value: prevValue, options } = this;

    this.value = value;

    if (prevValue === value) {
      return;
    }

    const { onChange } = options;

    onChange?.(value, prevValue);
  }
}

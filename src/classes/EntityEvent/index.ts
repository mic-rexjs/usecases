import { EntityEventOptions } from './types';

export class EntityEvent<T> extends Event {
  readonly entity: T;

  constructor(type: string, { entity }: EntityEventOptions<T>) {
    super(type);

    this.entity = entity;
  }
}

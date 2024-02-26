import { EntityEvent } from '../EntityEvent';
import { EntityChangeEventOptions } from './types';

export class EntityChangeEvent<T> extends EntityEvent<T> {
  readonly newEntity: T;

  readonly oldEntity: T;

  constructor(type: string, options: EntityChangeEventOptions<T>) {
    const { newEntity, oldEntity } = options;

    super(type, { entity: newEntity });

    this.newEntity = newEntity;
    this.oldEntity = oldEntity;
  }
}

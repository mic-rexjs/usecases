import { EntityStore } from '@/classes/EntityStore';
import { AsyncEntityGenerator, AsyncEntityGeneratorValues, EntityGenerator, EntityGeneratorValues } from '@/types';

export interface GenerateEntityOptions<T, TResult> {
  store?: EntityStore<T>;

  onYield?(currentEntity: T, prevEntity?: T): void;

  onReturn?(result: TResult, entity: T): void;
}

export interface GenerateEntityMethod {
  <T, TResult>(
    generator: AsyncEntityGenerator<T, TResult>,
    options?: GenerateEntityOptions<T, TResult>
  ): AsyncEntityGeneratorValues<T, TResult>;

  <T, TResult>(
    generator: EntityGenerator<T, TResult>,
    options?: GenerateEntityOptions<T, TResult>
  ): EntityGeneratorValues<T, TResult>;
}

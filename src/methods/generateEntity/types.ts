import { EntityStore } from '@/classes/EntityStore';
import { AsyncEntityGenerator, EntityGenerator, EntityGeneratorValues } from '@/types';

export interface GenerateEntityOptions<T, TResult, TReturn = EntityGeneratorValues<T, TResult>> {
  store?: EntityStore<T>;

  onYield?(newEntity: T, oldEntity?: T): T;

  onReturn?(result: TResult, entity: T): TResult;

  onGenerate?(entity: T, result: TResult): TReturn;
}

export interface EntityGeneratorHandler {
  <T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
    generator: AsyncEntityGenerator<T, TResult>,
    options?: GenerateEntityOptions<T, TResult, TReturn>,
  ): Promise<TReturn>;

  <T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
    generator: EntityGenerator<T, TResult>,
    options?: GenerateEntityOptions<T, TResult, TReturn>,
  ): TReturn;
}

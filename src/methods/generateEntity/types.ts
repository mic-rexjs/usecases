import { EntityStore } from '@/classes/EntityStore';
import { AsyncEntityGenerator, EntityGenerator, EntityGeneratorValues } from '@/types';

export interface GenerateEntityOptions<T, TResult, TReturn = EntityGeneratorValues<T, TResult>> {
  store?: EntityStore<T>;

  onYield?(newEntity: T, oldEntity?: T): void | boolean;

  onReturn?(result: TResult, entity: T): void;

  onGenerate?(entity: T, result: TResult): TReturn;
}

export interface GenerateEntityMethod {
  <T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
    generator: AsyncEntityGenerator<T, TResult>,
    options?: GenerateEntityOptions<T, TResult, TReturn>
  ): Promise<TReturn>;

  <T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
    generator: EntityGenerator<T, TResult>,
    options?: GenerateEntityOptions<T, TResult, TReturn>
  ): TReturn;
}

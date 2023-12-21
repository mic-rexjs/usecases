import { AsyncEntityGenerator, AsyncEntityGeneratorValues, EntityGenerator, EntityGeneratorValues } from '@/types';

export type IteratedValues<
  T,
  TResult,
  TGenerator extends EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>
> = TGenerator extends AsyncEntityGenerator<T, TResult>
  ? AsyncEntityGeneratorValues<T, TResult>
  : EntityGeneratorValues<T, TResult>;

export interface IterateEntityOptions<T, TResult> {
  onSync?(): T;

  onYield?(newEntity: T, oldEntity?: T): void;

  onReturn?(result: TResult, entity: T): void;
}

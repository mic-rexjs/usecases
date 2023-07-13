import {
  AsyncEntityGenerator,
  AsyncEntityGeneratorValues,
  EntityGenerator,
  EntityGeneratorValues,
  TypedEntityGenerator,
} from '../types';

export type ExtractEntityGeneratorValues<
  T,
  TResult,
  TGenerator extends EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>
> = TGenerator extends AsyncEntityGenerator<T, TResult>
  ? AsyncEntityGeneratorValues<T, TResult>
  : EntityGeneratorValues<T, TResult>;

export interface EntityGeneratorDoneOptions<T, TResult> {
  onSync?(): T;

  onYield?(entity: T, prevEntity?: T): void;

  onReturn?(result: TResult, entity: T): void;
}

export interface EntityGeneratorReducers {
  done<T, TResult, TGenerator extends TypedEntityGenerator<T, TResult> = TypedEntityGenerator<T, TResult>>(
    generator: TGenerator & TypedEntityGenerator<T, TResult>,
    options?: EntityGeneratorDoneOptions<T, TResult>
  ): ExtractEntityGeneratorValues<T, TResult, TGenerator>;
}

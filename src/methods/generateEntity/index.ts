import { AsyncEntityGenerator, EntityGenerator, EntityGeneratorValues, YieldEntityCallback } from '@/types';
import { EntityGeneratorHandler, GenerateEntityOptions } from './types';
import { EntityStore } from '@/classes/EntityStore';
import { isGenerator } from '../isGenerator';

export const generateEntity = (<T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
  generator: EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>,
  options: GenerateEntityOptions<T, TResult, TReturn> = {}
): TReturn | Promise<TReturn> => {
  const results: TResult[] = [];
  const isAsync = isGenerator(generator, Symbol.asyncIterator);

  const {
    store = new EntityStore(void 0 as T),
    onYield = (entity: T): T => {
      return entity;
    },
    onReturn = (result: TResult): TResult => {
      return result;
    },
    onGenerate = (entity: T, result: TResult): EntityGeneratorValues<T, TResult> => {
      return [entity, result] as EntityGeneratorValues<T, TResult>;
    },
  } = options;

  const generate = async (): Promise<EntityGeneratorValues<T, TResult>> => {
    for (;;) {
      const ret = generator.next(store.value);
      const syncRet = ret as IteratorResult<T | YieldEntityCallback<T>, TResult>;
      const asyncRet = ret as Promise<IteratorResult<T | YieldEntityCallback<T>, TResult>>;
      const { value, done } = isAsync ? await asyncRet : syncRet;
      const { value: currentEntity } = store;

      if (done) {
        const result = onReturn(value as TResult, currentEntity);

        results[0] = result;
        return [currentEntity, result] as EntityGeneratorValues<T, TResult>;
      }

      const newEntity = onYield(
        typeof value === 'function' ? (value as YieldEntityCallback<T>)(currentEntity) : value,
        currentEntity
      );

      store.setValue(newEntity);
    }
  };

  const promise = generate();

  if (results.length > 0) {
    return onGenerate(store.value, results[0]) as TReturn;
  }

  return promise.then(([entity, result]: EntityGeneratorValues<T, TResult>): TReturn => {
    return onGenerate(entity, result) as TReturn;
  });
}) as EntityGeneratorHandler;

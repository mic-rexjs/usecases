import { isGenerator } from '../isGenerator';
import { EntityGeneratorHandler, GenerateEntityOptions } from './types';
import { EntityStore } from '@/classes/EntityStore';
import { AsyncEntityGenerator, EntityGenerator, EntityGeneratorValues, YieldEntityCallback } from '@/types';

export const generateEntity = (<T, TResult, TReturn = EntityGeneratorValues<T, TResult>>(
  generator: EntityGenerator<T, TResult> | AsyncEntityGenerator<T, TResult>,
  options: GenerateEntityOptions<T, TResult, TReturn> = {},
): TReturn | Promise<TReturn> => {
  const results: TResult[] = [];
  const isAsync = isGenerator(generator, Symbol.asyncIterator);

  const {
    store = new EntityStore(void 0 as T),
    onYield = (entity: T): T => {
      return entity;
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
        results[0] = value;
        return [currentEntity, value];
      }

      let newEntity = value as T;

      if (typeof value === 'function') {
        newEntity = (value as YieldEntityCallback<T>)(currentEntity);

        if (newEntity instanceof Promise) {
          newEntity = await newEntity;
        }
      }

      newEntity = onYield(newEntity, currentEntity);
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

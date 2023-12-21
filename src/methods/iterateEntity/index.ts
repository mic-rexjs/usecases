import { EntityGeneratorValues, TypedEntityGenerator, YieldEntityCallback } from '@/types';
import { IterateEntityOptions, IteratedValues } from './types';

export const iterateEntity = <
  T,
  TResult,
  TGenerator extends TypedEntityGenerator<T, TResult> = TypedEntityGenerator<T, TResult>
>(
  generator: TGenerator & TypedEntityGenerator<T, TResult>,
  options: IterateEntityOptions<T, TResult> = {}
): IteratedValues<T, TResult, TGenerator> => {
  const values: Partial<EntityGeneratorValues<T, TResult>> = [];

  const {
    onSync = (): T => {
      return values[0] as T;
    },
    onYield,
    onReturn,
  } = options;

  const iterate = async (): Promise<EntityGeneratorValues<T, TResult>> => {
    for (;;) {
      const ret = generator.next(onSync());
      const { value, done: hasDone } = ret instanceof Promise ? await ret : ret;
      const oldEntity = onSync();

      if (hasDone) {
        const result = value as TResult;

        values[1] = result;
        onReturn?.(result, oldEntity);
        break;
      }

      const isFunction = typeof value === 'function';
      const newEntity = isFunction ? (value as YieldEntityCallback<T>)(oldEntity) : (value as T);

      values[0] = newEntity;
      onYield?.(newEntity, oldEntity);
    }

    return values as EntityGeneratorValues<T, TResult>;
  };

  const promise = iterate();

  return (values.length === 0 ? promise : values) as IteratedValues<T, TResult, TGenerator>;
};

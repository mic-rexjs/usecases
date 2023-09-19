import { EntityGeneratorValues, TypedEntityGenerator, YieldEntityCallback } from '@/types';
import { EntityGeneratorReducers, EntityGeneratorDoneOptions, ExtractEntityGeneratorValues } from './types';

export const entityGeneratorUseCase = (): EntityGeneratorReducers => {
  const done = <T, TResult, TGenerator extends TypedEntityGenerator<T, TResult>>(
    generator: TGenerator,
    options: EntityGeneratorDoneOptions<T, TResult> = {}
  ): ExtractEntityGeneratorValues<T, TResult, TGenerator> => {
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
        const prevEntity = onSync();

        if (hasDone) {
          const result = value as TResult;

          values[1] = result;
          onReturn?.(result, prevEntity);
          break;
        }

        const isFunction = typeof value === 'function';
        const newEntity = isFunction ? (value as YieldEntityCallback<T>)(prevEntity) : (value as T);

        values[0] = newEntity;
        onYield?.(newEntity, prevEntity);
      }

      return values as EntityGeneratorValues<T, TResult>;
    };

    const promise = iterate();

    return (values.length === 0 ? promise : values) as ExtractEntityGeneratorValues<T, TResult, TGenerator>;
  };

  return {
    done,
  };
};

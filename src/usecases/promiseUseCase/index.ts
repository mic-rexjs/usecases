import {
  PromiseFulfilledEventHandler,
  PromiseInitRejectedErrorOptions,
  PromiseReducers,
  PromiseWithResolversOptions,
  StatefulPromiseWithResolvers,
} from './types';
import { defaultPromiseResult } from '@/entities/promiseResult';
import { PromiseResult } from '@/entities/promiseResult/types';
import { RejectedCode, RejectedError } from '@/entities/rejectedError/types';
import { createUseCase } from '@/methods/createUseCase';
import { UseCase } from '@/types';

export const promiseUseCase = createUseCase((): UseCase<PromiseReducers> => {
  let initOptions: PromiseInitRejectedErrorOptions<unknown> = {};
  const resolversMap = new Map<PropertyKey, StatefulPromiseWithResolvers<unknown>>();

  return (): PromiseReducers => {
    const initRejectedError = <T>(options: PromiseInitRejectedErrorOptions<T>): void => {
      initOptions = options;
    };

    const reject = <T>(code: RejectedCode, msg: string, data: T): Promise<never> => {
      const error: RejectedError<T> = {
        code,
        msg,
        data,
        content:
          typeof data === 'object' && data?.toString === Object.prototype.toString
            ? JSON.stringify(data)
            : `${data instanceof Error ? data.stack : data}`,
      };

      initOptions.onReject?.(error);
      return Promise.reject(error);
    };

    const rejectCode = (code: RejectedCode): Promise<never> => {
      return reject(code, '', null);
    };

    const rejectMsg = (code: RejectedCode, msg: string): Promise<never> => {
      return reject(code, msg, null);
    };

    const rejectData = <T>(code: RejectedCode, data: T): Promise<never> => {
      return reject(code, '', data);
    };

    const resolve = <T>(promise: T | PromiseLike<T>, rejectedCode: RejectedCode, rejectedMsg?: string): Promise<T> => {
      return resolveWith(
        promise,
        (res: T): T => {
          return res;
        },
        rejectedCode,
        rejectedMsg,
      );
    };

    const resolveId = (
      promise: Awaited<string>,
      rejectedCode: RejectedCode,
      rejectedMsg?: string,
    ): Promise<Awaited<string>> => {
      return resolveWith(
        promise,
        (unsafedId: Awaited<string>): Awaited<string> => {
          if (unsafedId) {
            return unsafedId;
          }

          throw unsafedId;
        },
        rejectedCode,
        rejectedMsg,
      );
    };

    const resolveNonNullable = <T>(
      promise: T | PromiseLike<T>,
      rejectedCode: RejectedCode,
      rejectedMsg: string = '',
    ): Promise<NonNullable<T>> => {
      const isNullable = typeof promise === 'undefined' || promise === null;

      if (isNullable) {
        return rejectMsg(rejectedCode, rejectedMsg);
      }

      return resolve(promise, rejectedCode, rejectedMsg) as Promise<NonNullable<Awaited<T>>>;
    };

    const resolveResult = async <T, TError>(
      promise: T | PromiseLike<T>,
      rejectedCode: RejectedCode = '',
      rejectedMsg?: string,
    ): Promise<PromiseResult<NonNullable<T>, TError>> => {
      const result: Partial<PromiseResult<NonNullable<T>, TError>> = {};

      await resolveNonNullable(promise, rejectedCode, rejectedMsg)
        .then((value: NonNullable<T>): void => {
          result.value = value;
        })
        .catch((error: RejectedError<TError>): void => {
          result.error = error;
        });

      return {
        ...defaultPromiseResult,
        ...result,
      } as PromiseResult<NonNullable<T>, TError>;
    };

    const resolveWith = <T>(
      promise: T | PromiseLike<T>,
      onFulfilled: PromiseFulfilledEventHandler<T>,
      rejectedCode: RejectedCode,
      rejectedMsg = '',
    ): Promise<T> => {
      return Promise.resolve(promise)
        .then(onFulfilled)
        .catch(<TError>(error: TError): Promise<never> => {
          return reject(rejectedCode, rejectedMsg, error);
        });
    };

    const withResolvers = <T>(options: PromiseWithResolversOptions = {}): StatefulPromiseWithResolvers<T> => {
      const { key = '', autoRelease = false } = options;
      const hasKey = key !== '';
      const resolvers = hasKey ? resolversMap.get(key) : null;

      if (resolvers) {
        return resolvers as StatefulPromiseWithResolvers<T>;
      }

      const release = (): void => {
        resolversMap.delete(key);
      };

      const newResolvers: StatefulPromiseWithResolvers<T> = {
        ...Promise.withResolvers<T>(),
        key: key,
        fulfilled: false,
        rejected: false,
        pending: true,
        release,
      };

      const { promise } = newResolvers;

      promise
        .then((): void => {
          newResolvers.fulfilled = true;
          newResolvers.rejected = false;
        })
        .catch((): void => {
          newResolvers.fulfilled = false;
          newResolvers.rejected = true;
        })
        .finally((): void => {
          if (autoRelease) {
            release();
          }

          newResolvers.pending = false;
        });

      if (hasKey) {
        resolversMap.set(key, newResolvers as StatefulPromiseWithResolvers<unknown>);
      }

      return newResolvers;
    };

    return {
      initRejectedError,
      reject,
      rejectCode,
      rejectData,
      rejectMsg,
      resolve,
      resolveId,
      resolveNonNullable,
      resolveResult,
      resolveWith,
      withResolvers,
    };
  };
});

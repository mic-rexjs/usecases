import { createUseCase } from '@/methods/createUseCase';
import { RejectedErrorReducers, FulfilledEventHandler, InitRejectedErrorOptions } from './types';
import { UseCase } from '@/types';
import { RejectedCode, RejectedError } from '@/entities/rejectedError/types';

export const rejectedErrorUseCase = createUseCase((): UseCase<RejectedErrorReducers> => {
  let initOptions: InitRejectedErrorOptions<unknown> = {};

  return (): RejectedErrorReducers => {
    const initRejectedError = <T>(options: InitRejectedErrorOptions<T>): void => {
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

    const resolveId = (promise: Awaited<string>, rejectedMsg: string): Promise<Awaited<string>> => {
      return resolveWith(
        promise,
        (unsafedId: Awaited<string>): Awaited<string> => {
          if (unsafedId) {
            return unsafedId;
          }

          throw unsafedId;
        },
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

    const resolveWith = <T>(
      promise: T | PromiseLike<T>,
      onFulfilled: FulfilledEventHandler<T>,
      rejectedCode: RejectedCode,
      rejectedMsg = '',
    ): Promise<T> => {
      return Promise.resolve(promise)
        .then(onFulfilled)
        .catch(<TError>(error: TError): Promise<never> => {
          return reject(rejectedCode, rejectedMsg, error);
        });
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
      resolveWith,
    };
  };
});

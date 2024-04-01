import { createUseCase } from '@/methods/createUseCase';
import { RejectedErrorReducers, FulfilledEventHandler, InitRejectedErrorOptions } from './types';
import { UseCase } from '@/types';
import { RejectedCode, RejectedError } from '@/entities/rejectedError/types';

export const rejectedErrorUseCase = createUseCase((): UseCase<RejectedErrorReducers> => {
  let initOptions: InitRejectedErrorOptions<unknown>;

  return (): RejectedErrorReducers => {
    const initRejectedError = <T>(options: InitRejectedErrorOptions<T>): void => {
      initOptions = options;
    };

    const reject = <T>(code: RejectedCode, msg: string, data: T): Promise<never> => {
      const error: RejectedError<T> = {
        code,
        msg,
        data,
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

    const resolve = <T>(target: T | PromiseLike<T>, rejectedCode: RejectedCode, rejectedMsg?: string): Promise<T> => {
      return resolveWith(
        target,
        (res: T): T => {
          return res;
        },
        rejectedCode,
        rejectedMsg,
      );
    };

    const resolveId = (target: Awaited<string>, rejectedMsg: string): Promise<Awaited<string>> => {
      return resolveWith(
        target,
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
      target: T | PromiseLike<T>,
      rejectedCode: RejectedCode,
      rejectedMsg?: string,
    ): Promise<NonNullable<T>> => {
      return resolveWith(
        target,
        (res: T): NonNullable<T> | Promise<T> => {
          const isNullable = typeof res === 'undefined' || res === null;

          if (isNullable) {
            return Promise.reject(res);
          }

          return res;
        },
        rejectedCode,
        rejectedMsg,
      ) as Promise<NonNullable<Awaited<T>>>;
    };

    const resolveWith = <T>(
      target: T | PromiseLike<T>,
      onFulfilled: FulfilledEventHandler<T>,
      rejectedCode: RejectedCode,
      rejectedMsg = '',
    ): Promise<T> => {
      return Promise.resolve(target)
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

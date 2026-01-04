import { PromiseResult } from '@/entities/promiseResult/types';
import { RejectedCode, RejectedError } from '@/entities/rejectedError/types';
import { Reducers } from '@/types';

export interface FulfilledEventHandler<T> {
  (res: T): T | PromiseLike<T>;
}

export interface InitRejectedErrorOptions<T> {
  onReject?(error: RejectedError<T>): void;
}

export type PromiseReducers = Reducers<{
  initRejectedError<T>(options: InitRejectedErrorOptions<T>): void;

  reject<T>(code: RejectedCode, msg: string, data: T): Promise<never>;

  rejectCode(code: RejectedCode): Promise<never>;

  rejectData<T>(code: RejectedCode, data: T): Promise<never>;

  rejectMsg(code: RejectedCode, msg: string): Promise<never>;

  resolve<T>(promise: T | PromiseLike<T>, rejectedCode: RejectedCode, rejectedMsg?: string): Promise<T>;

  resolveId(promise: Promise<string> | string, rejectedCode: RejectedCode, rejectedMsg?: string): Promise<string>;

  resolveNonNullable<T>(
    promise: T | PromiseLike<T>,
    rejectedCode: RejectedCode,
    rejectedMsg?: string,
  ): Promise<NonNullable<T>>;

  resolveResult<T, TError>(
    promise: T | PromiseLike<T>,
    rejectedCode?: RejectedCode,
    rejectedMsg?: string,
  ): Promise<PromiseResult<NonNullable<T>, TError>>;

  resolveWith<T>(
    promise: T | PromiseLike<T>,
    onFulfilled: FulfilledEventHandler<T>,
    rejectedCode: RejectedCode,
    rejectedMsg?: string,
  ): Promise<T>;
}>;

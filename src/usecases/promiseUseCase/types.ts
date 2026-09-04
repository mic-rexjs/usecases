import { PromiseResult } from '@/entities/promiseResult/types';
import { RejectedCode, RejectedError } from '@/entities/rejectedError/types';
import { Reducers } from '@/types';

export interface StatefulPromiseWithResolvers<T> extends PromiseWithResolvers<T> {
  key: PropertyKey;

  fulfilled: boolean;

  rejected: boolean;

  pending: boolean;
}

export interface PromiseFulfilledEventHandler<T> {
  (res: T): T | PromiseLike<T>;
}

export interface PromiseInitRejectedErrorOptions<T> {
  onReject?(error: RejectedError<T>): void;
}

export interface PromiseWithResolversOptions {
  /**
   * 多次使用同样的 `key`，则会返回同一个 `PromiseWithResolvers` 实例，
   * 直到调用 `release` 释放该 `key` 所标记的实例。
   */
  key?: PropertyKey;

  /**
   * 是否在 `Promise` 结束后自动释放该 `key` 所标记的实例。
   */
  autoRelease?: boolean;
}

export interface PromiseCacheResolversOptions<T = unknown> extends Omit<PromiseWithResolversOptions, 'key'> {
  resolvers?: StatefulPromiseWithResolvers<T>;
}

export type PromiseReducers = Reducers<{
  cacheResolvers<T>(key: PropertyKey, options?: PromiseCacheResolversOptions<T>): StatefulPromiseWithResolvers<T>;

  uncacheResolvers(key: PropertyKey): void;

  initRejectedError<T>(options: PromiseInitRejectedErrorOptions<T>): void;

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
    onFulfilled: PromiseFulfilledEventHandler<T>,
    rejectedCode: RejectedCode,
    rejectedMsg?: string,
  ): Promise<T>;

  withResolvers<T>(key: PropertyKey, options?: PromiseCacheResolversOptions): StatefulPromiseWithResolvers<T>;
  withResolvers<T>(options?: PromiseWithResolversOptions): StatefulPromiseWithResolvers<T>;
}>;

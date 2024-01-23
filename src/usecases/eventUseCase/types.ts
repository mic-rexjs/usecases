import { AsyncEntityGenerator, EntityGenerator, EntityReducers, RestArguments } from '@/types';
import { ObjectReducers } from '../objectUseCase/types';

export type EventName<T extends string = string> = `on${Capitalize<T>}`;

export type ExtractEventNames<T, K extends keyof T & EventName = keyof T & EventName> = K extends `on${infer TName}`
  ? NonNullable<T[K]> extends (...args: RestArguments) => unknown
    ? Uncapitalize<TName>
    : never
  : never;

export type ExtractEventListeners<T, TNames extends ExtractEventNames<T>> = Extract<
  T[EventName<TNames> & keyof T],
  (...args: RestArguments) => unknown
>;

export type EventMap<T> = {
  [K in ExtractEventNames<T>]?: ExtractEventListeners<T, K>[];
};

export type EventReducers<T> = EntityReducers<
  EventMap<T>,
  {
    addListener<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): EntityGenerator<M, void>;

    addListenerOnce<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): AsyncEntityGenerator<M, void>;

    emit<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      ...args: Parameters<ExtractEventListeners<S, TName>>
    ): boolean;

    eventNames<S extends T, M extends EventMap<S>>(entity: M): ExtractEventNames<S>[];

    off<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): EntityGenerator<M, void>;

    on<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): EntityGenerator<M, void>;

    once<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): AsyncEntityGenerator<M, void>;

    prependListener<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): EntityGenerator<M, void>;

    prependOnceListener<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): AsyncEntityGenerator<M, void>;

    removeAllListeners<S extends T, M extends EventMap<S>>(
      entity: M,
      eventName?: ExtractEventNames<S>
    ): EntityGenerator<M, void>;

    removeListener<S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
      entity: M,
      eventName: TName,
      listener: ExtractEventListeners<S, TName>
    ): EntityGenerator<M, void>;
  },
  ObjectReducers<EventMap<T>>
>;

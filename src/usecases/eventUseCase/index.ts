import { AsyncEntityGenerator, EntityGenerator, RestArguments } from '@/types';
import { objectUseCase } from '../objectUseCase';
import { EventMap, EventReducers, ExtractEventListeners, ExtractEventNames } from './types';

export const eventUseCase = <T>(): EventReducers<T> => {
  const objectReducers = objectUseCase();

  const addListener = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): EntityGenerator<M, void> => {
    return listen(entity, eventName, listener);
  };

  const addListenerOnce = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): AsyncEntityGenerator<M, void> => {
    return listenOnce(entity, eventName, listener);
  };

  const emit = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    ...args: Parameters<ExtractEventListeners<S, TName>>
  ): boolean => {
    const { [eventName]: listeners = [] } = entity;

    if (listeners.length === 0) {
      return false;
    }

    for (const listener of listeners) {
      listener(...(args as RestArguments));
    }

    return true;
  };

  const eventNames = <S extends T, M extends EventMap<S>>(entity: M): ExtractEventNames<S>[] => {
    return Object.keys(entity) as ExtractEventNames<S>[];
  };

  const off = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): EntityGenerator<M, void> => {
    return removeListener(entity, eventName, listener);
  };

  const on = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): EntityGenerator<M, void> => {
    return addListener(entity, eventName, listener);
  };

  const once = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): AsyncEntityGenerator<M, void> => {
    return addListenerOnce(entity, eventName, listener);
  };

  const listen = function* <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>,
    prepend = false
  ): EntityGenerator<M, void> {
    const { [eventName]: listeners = [] } = entity;

    yield {
      ...entity,
      [eventName]: prepend ? [listener, ...listeners] : [...listeners, listener],
    };
  };

  const listenOnce = async function* <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>,
    prepend?: boolean
  ): AsyncEntityGenerator<M, void> {
    let resolve: (value: null) => void;

    // `ts 5.4.0` 以后要替换成 `Promise.withResolvers`
    const promise = new Promise((res: (value: null) => void): void => {
      resolve = res;
    });

    const onceListener = ((...args: RestArguments): unknown => {
      const returnValue = listener(...args);

      resolve(null);
      return returnValue;
    }) as ExtractEventListeners<S, TName>;

    yield* listen(entity, eventName, onceListener, prepend);
    await promise;

    const currentEntity = yield (e: M): M => {
      return e;
    };

    yield* removeListener<S, M, TName>(currentEntity, eventName, onceListener);
  };

  const prependListener = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): EntityGenerator<M, void> => {
    return listen(entity, eventName, listener, true);
  };

  const prependOnceListener = <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): AsyncEntityGenerator<M, void> => {
    return listenOnce(entity, eventName, listener, true);
  };

  const removeAllListeners = function* <S extends T, M extends EventMap<S>>(
    entity: M,
    eventName?: ExtractEventNames<S>
  ): EntityGenerator<M, void> {
    if (eventName) {
      const { [eventName]: listeners, ...newEntity } = entity;

      yield newEntity as M;
    }

    yield {} as M;
  };

  const removeListener = function* <S extends T, M extends EventMap<S>, TName extends ExtractEventNames<S>>(
    entity: M,
    eventName: TName,
    listener: ExtractEventListeners<S, TName>
  ): EntityGenerator<M, void> {
    const { [eventName]: listeners = [] } = entity;
    const index = listeners.indexOf(listener);

    if (index === -1) {
      return;
    }

    const newListeners = listeners.slice();

    newListeners.splice(index, 1);

    yield {
      ...entity,
      [eventName]: newListeners,
    };
  };

  return {
    ...objectReducers,
    addListener,
    addListenerOnce,
    emit,
    eventNames,
    off,
    on,
    once,
    prependListener,
    removeAllListeners,
    prependOnceListener,
    removeListener,
  };
};

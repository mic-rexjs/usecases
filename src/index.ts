import './types';

export { EntityStore } from './classes/EntityStore';

export { generateEntity } from './methods/generateEntity';
export { createUseCase } from './methods/createUseCase';
export { createEntityReducers } from './methods/createEntityReducers';

export { entityUseCase } from './usecases/entityUseCase';
export { arrayUseCase } from './usecases/arrayUseCase';
export { objectUseCase } from './usecases/objectUseCase';
export { runtimeUseCase } from './usecases/runtimeUseCase';

export type {
  Reducer,
  Reducers,
  ReducerMap,
  UseCase,
  EntityReducer,
  EntityReducers,
  EntityReducerMap,
  EntityUseCase,
  EntityGenerator,
  AsyncEntityGenerator,
} from './types';

export type { ArrayReducers } from './usecases/arrayUseCase/types';
export type { ObjectReducers } from './usecases/objectUseCase/types';

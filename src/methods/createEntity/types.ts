export interface CreateEntityFactory<T> {
  (): T;
}

export interface CreateEntity {
  <T>(factory: CreateEntityFactory<T>): T;
  <T>(...entities: Partial<T>[]): T;
}

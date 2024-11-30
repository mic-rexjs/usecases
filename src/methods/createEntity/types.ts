export interface CreateEntityFactory<T> {
  (): T;
}

export interface CreateEntity {
  <T>(factory: CreateEntityFactory<T>): T;
  <T extends object>(...entities: Partial<T>[]): T;
}

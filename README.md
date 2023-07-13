## 📚 Description
UseCases of Clean Architecture.

## 📦 Install

```bash
$ npm install --save @rex-js/usecases
# -
$ yarn add --dev @rex-js/usecases
```

## 🔗 Links
- [Useage - Entity Mode](#useage-entity-mode)
- [Useage - Non-Entity Mode](#useage-non-entity-mode)
- [Usage - with React](#usage-with-react)
- [Test Demos](#test-demos)

## 🔨 Useage - Entity Mode {#useage-entity-mode}
```ts
// a.ts
import { objectUseCase, EntityReducers, EntityGenerator } from '@mic/core';
import { entityReducerUseCase } from '@mic/core/entityReducerUseCase';
import { ObjectReducers } from '@mic/core/objectUseCase/types';

interface File {
  path: string;
  content: string;
}

interface FileUseCaseOptions {
  maxContentLength?: number;
}

// All reducers should provide the first argument with an entity type T, such as `file: T`.
type FileReducers<T extends File> = EntityReducers<
  T,
  {
    writeFile(entity: T, content: string): EntityGenerator<T, string>;
    isTxt(entity: T): boolean;
  },
  // optional to extends an existed reducers
  ObjectReducers<T>
>;

const fileUseCase = <T extends File>({ maxContentLength = 2000 }: FileUseCaseOptions = {}): FileReducers<T> => {
  /**
   * if you have not extends an existed reducers,
   * you should call `entityUseCase` at here,
   * such as `const entityReducers = entityUseCase<T>()`.
   */
  const objectReducers = objectUseCase<T>();

  const writeFile = function* (entity: T, content: string): EntityGenerator<T, string> {
    const { content: prevContent } = entity;
    const newContent = prevContent + content;

    if (newContent.length > maxContentLength) {
      throw 'max length error';
    }

    // set new entity by yield expression
    yield {
      ...entity,
      content: newContent,
    };

    // return the new content
    return newContent;
  };

  const isTxt = (entity: T): boolean => {
    const { path } = entity;

    return path.endsWith('.txt');
  };

  return { ...objectReducers, writeFile, isTxt };
};

// b.ts
const defaultFile: File = { path: '', content: '' };
const { createEntityReducers } = entityReducerUseCase();
const { writeFile, isTxt, setEntity } = createEntityReducers(defaultFile, fileUseCase, { maxContentLength: 50 });

// no need to provide an entity parameter when you call these reducers!
const [entity1, content1] = writeFile('hello world');
isTxt(); // false

console.log(entity1); // { path: '', content: 'hello world' }
console.log(content1); // 'hello world'

const [entity2] = setEntity({ path: 'my.txt' });
isTxt(); // true

console.log(entity2); // { path: 'my.txt', content: 'hello world' }
```

## 🔨 Useage - Non-Entity Mode {#useage-non-entity-mode}
```ts
// a.ts
import { Reducers } from '@mic/core';

type MathReducers = Reducers<{
  add(value1: number, value2: number): number;

  subtraction(value1: number, value2: number): number;
}>;

const mathUseCase = (): MathReducers => {
  const add = (value1: number, value2: number): number => {
    return value1 + value2;
  };

  const subtraction = (value1: number, value2: number): number => {
    return value1 - value2;
  };

  return { add, subtraction };
};

// b.ts
const { add, subtraction } = mathUseCase();

add(1, 2); // 3
subtraction(5, 3); // 2
```

## 🔨 Usage - with React {#usage-with-react}
See more about [@rex-js/usecase-react](https://github.com/china-liji/mic-usecase-react)

## ❓ Test Demos {#test-demos}
- [entityUseCase](https://github.com/china-liji/mic-usecases/blob/main/src/entityUseCase/index.test.ts)
- [arrayUseCase](https://github.com/china-liji/mic-usecases/blob/main/src/arrayUseCase/index.test.ts)
- [objectUseCase](https://github.com/china-liji/mic-usecases/blob/main/src/objectUseCase/index.test.ts)
- [entityReducerUseCase](https://github.com/china-liji/mic-usecases/blob/main/src/entityReducerUseCase/index.test.ts)
- [entityGeneratorUseCase](https://github.com/china-liji/mic-usecases/blob/main/src/entityGeneratorUseCase/index.test.ts)
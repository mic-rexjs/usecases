## Description
UseCases of Clean Architecture.

## Install
```bash
$ npm install --save @mic-rexjs/usecases
# -
$ yarn add --dev @mic-rexjs/usecases
```

## Links
- [Usage with Non-Entity Mode](#usage-with-non-entity-mode)
- [Usage with Entity Mode](#usage-with-entity-mode)
- [Usage with React](#usage-with-react)
- [Test Demos](#test-demos)

## Usage with Non-Entity Mode
```ts
// a.ts
import { Reducers } from '@mic-rexjs/usecases';

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

## Usage with Entity Mode
```ts
// a.ts
import {
	objectUseCase,
	ObjectReducers,
	EntityGenerator,
	EntityReducers
} from '@mic-rexjs/usecases';

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
    const { content: oldContent } = entity;
    const newContent = oldContent + content;

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
import { createEntityReducers } from '@mic-rexjs/usecases';
const defaultFile: File = { path: '', content: '' };
// Init reducers with an entity, we need not provide the entity any more.
const { writeFile, isTxt, setEntity } = createEntityReducers(defaultFile, fileUseCase, { maxContentLength: 50 });

// we need not provide the entity any more.
const [entity1, content1] = writeFile('hello world');
isTxt(); // false

console.log(entity1); // { path: '', content: 'hello world' }
console.log(content1); // 'hello world'

const [entity2] = setEntity({ path: 'my.txt' });
isTxt(); // true

console.log(entity2); // { path: 'my.txt', content: 'hello world' }
```

## Usage with React
See more about [@mic-rexjs/usecases-react](https://www.npmjs.com/package/@mic-rexjs/usecases-react)

## Test Demos
- [createEntityReducers](https://github.com/mic-rexjs/usecases/blob/main/src/methods/createEntityReducers/index.test.ts)
- [generateEntity](https://github.com/mic-rexjs/usecases/blob/main/src/usecases/generateEntity/index.test.ts)
- [entityUseCase](https://github.com/mic-rexjs/usecases/blob/main/src/usecases/entityUseCase/index.test.ts)
- [arrayUseCase](https://github.com/mic-rexjs/usecases/blob/main/src/usecases/arrayUseCase/index.test.ts)
- [objectUseCase](https://github.com/mic-rexjs/usecases/blob/main/src/usecases/objectUseCase/index.test.ts)
- [runtimeUseCase](https://github.com/mic-rexjs/usecases/blob/main/src/usecases/runtimeUseCase/index.test.ts)

import path from 'path';
import fs from 'fs';
import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const { compilerOptions }: typeof import('../tsconfig.json') = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../tsconfig.json'), 'utf8'),
);

const initConfig = (): Config => {
  const { paths } = compilerOptions;
  const projectDir = path.resolve(__dirname, '../');

  return {
    testEnvironment: 'node',
    rootDir: projectDir,
    displayName: 'test',
    testRegex: '\\.test\\.tsx?',
    transform: { '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: './tsconfig.json' }] },
    moduleNameMapper: pathsToModuleNameMapper(
      Object.fromEntries(
        Object.getOwnPropertyNames(paths).map((name: string): [string, string[]] => {
          return [
            name,
            paths[name as keyof typeof paths].map((p: string): string => {
              return p.replace(/^\.\//g, '<rootDir>/');
            }),
          ];
        }),
      ),
    ),
  };
};

export default initConfig();

import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const { baseUrl, paths } = compilerOptions;

const config: Config = {
  testEnvironment: 'node',
  rootDir: baseUrl,
  displayName: 'test',
  testRegex: '\\.test\\.tsx?',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
  moduleNameMapper: pathsToModuleNameMapper(
    Object.fromEntries(
      Object.getOwnPropertyNames(paths).map((name: string): [string, string[]] => {
        return [
          name,
          paths[name as keyof typeof paths].map((path: string): string => {
            return path.replace(/^\.\//g, '<rootDir>/');
          }),
        ];
      })
    )
  ),
};

export default config;

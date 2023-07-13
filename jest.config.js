const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');
const { baseUrl, paths } = compilerOptions;

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
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
      Object.getOwnPropertyNames(paths).map((name) => {
        return [
          name,
          paths[name].map((path) => {
            return path.replace(/^\.\//g, '<rootDir>/');
          }),
        ];
      })
    )
  ),
  modulePathIgnorePatterns: ['/node_modules/', '<rootDir>/common/Common/assets'],
};

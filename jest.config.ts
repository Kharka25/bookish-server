import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testRegex: '/__test__/.*spec\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/src/setupFilesAfterEnv.ts'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  moduleNameMapper: {
    '^@src/(.*)': '<rootDir>/src/$1',
    '^@config(.*)$': '<rootDir>/src/config/$1',
    '^@controllers(.*)$': '<rootDir>/src/controllers/$1',
    '^@db(.*)$': '<rootDir>/src/db/$1',
    '^@middlewares(.*)$': '<rootDir>/src/middlewares/$1',
    '^@models(.*)$': '<rootDir>/src/models/$1',
    '^@routers(.*)$': '<rootDir>/src/routers/$1',
    '^@types(.*)$': '<rootDir>/src/types/$1',
    '^@utils(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;

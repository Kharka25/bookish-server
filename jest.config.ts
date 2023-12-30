import { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	testRegex: '/test/.*spec\\.(jsx?|tsx?)$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	setupFilesAfterEnv: ['<rootDir>/src/setupFilesAfterEnv.ts'],
	moduleNameMapper: {
		'^@src/(.*)': '<rootDir>/src/$1',
		'^@controllers(.*)$': '<rootDir>/src/controllers/$1',
		'^@db(.*)$': '<rootDir>/src/db/$1',
		'^@models(.*)$': '<rootDir>/src/models/$1',
		'^@routers(.*)$': '<rootDir>/src/routers/$1',
		'^@utils(.*)$': '<rootDir>/src/utils/$1',
	},
};

export default config;

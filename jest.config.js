module.exports = {
  preset: 'jest-preset-angular',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.spec.json'
    }
  },
  moduleNameMapper: {
    "^@simple-deck/test-decorators$": "<rootDir>/src/index.ts",

    "^@simple-deck/test-decorators/(.*)$": "<rootDir>/src/$1"
  }
};
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.spec.json'
    }
  },
  moduleNameMapper: {
    "^@simple-deck/test-decorators$": "<rootDir>/src/index.ts"
  }
};
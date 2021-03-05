module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    "^@simple-deck/test-decorators$": "../../src/index.ts"
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  }
};
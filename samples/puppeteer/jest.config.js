module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    "^@simple-deck/test-decorators$": "../../dist/index.ts",
    "^@simple-deck/test-decorators/(.*)$": "../../dist/$1"
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  }
};
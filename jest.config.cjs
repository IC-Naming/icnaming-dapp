module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/.*'],
  setupFiles: ["fake-indexeddb/auto"],
  setupFilesAfterEnv: ['<rootDir>/src/jest/setup-jest.ts'],
  collectCoverage: true,
  verbose: true,
  coverageReporters: ['html'],
  coveragePathIgnorePatterns: ['<rootDir>/src/jest/*', '.mock.ts', '.idl', '<rootDir>/src/utils/storage'],
  preset: 'ts-jest',
  testEnvironment: 'node'
};

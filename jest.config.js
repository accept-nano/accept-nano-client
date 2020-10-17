module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['jest-canvas-mock'],
  moduleNameMapper: {
    'spin.js': '<rootDir>/test/__mocks__/spin.js',
  },
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // resolve .ts before .js: src/ also holds old compiled .js files
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
};

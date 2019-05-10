module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!src/*.js'],
  coverageDirectory: './coverage',
  coverageReporters: ['html', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  modulePaths: ['<rootDir>/src/']
};

export default {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/*.tsx', '!src/types/**'],
  coverageDirectory: './coverage',
  coverageReporters: ['html', 'text-summary'],
  modulePaths: ['<rootDir>/src/'],
  moduleNameMapper: {
    '\\.s?css$': 'identity-obj-proxy'
  },
  // an explicit transform keeps the suite on CommonJS, which avoids having to
  // run jest under --experimental-vm-modules
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          jsx: 'react-jsx',
          esModuleInterop: true
        }
      }
    ]
  }<% if (testFramework === 'rtl') { %>,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']<% } %>
};

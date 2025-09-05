// jest.config.cjs
module.exports = {
    // run tests from your src folder
    roots: ['<rootDir>/src'],
  
    // your helpers don't need a DOM; 'node' is fine
    testEnvironment: 'node',
  
    // transpile ESM/JSX with babel-jest
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  
    // treat JS/JSX as ESM so Jest won’t choke on `import`
    
  
    // optional, but avoids surprises
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  };
  
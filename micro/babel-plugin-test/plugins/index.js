module.exports = function myImport({ types }) {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          console.log('enter Program');
          //   console.log('path', path);
          //   console.log('state', state);
        },
      },
      ImportDeclaration: {
        enter(path, state) {
          console.log('enter ImportDeclaration');
          console.log('path', path);
          //   console.log('state', state);
        },
      },
    },
  };
};

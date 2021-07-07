const path = require('path');
const JSZip = require('jszip');

class ZipPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // console.log('keys', Object.keys(compiler.hooks));

    compiler.hooks.done.tap('done', () => {
      console.log('done');
    });
    compiler.hooks.shouldEmit.tap('shouldEmit', () => {
      console.log('shouldEmit');
    });
    compiler.hooks.run.tap('run', () => {
      console.log('run');
    });
    compiler.hooks.compile.tap('compile', () => {
      console.log('compile');
    });
    compiler.hooks.compilation.tap('compilation', () => {
      console.log('compilation');
    });
    compiler.hooks.afterDone.tap('afterDone', () => {
      console.log('afterDone');
    });
    compiler.hooks.finishMake.tap('finishMake', () => {
      console.log('finishMake');
    });
    compiler.hooks.make.tap('make', () => {
      console.log('make');
    });
    compiler.hooks.thisCompilation.tap('thisCompilation', () => {
      console.log('thisCompilation');
    });

    compiler.hooks.normalModuleFactory.tap(
      'normalModuleFactory',
      (normalModuleFactory) => {
        // console.log(Object.keys(normalModuleFactory.hooks));

        normalModuleFactory.hooks.createModule.tap(
          'createModule',
          (createModule) => {
            console.log('createModule', createModule.resourceResolveData.path);
          }
        );

        normalModuleFactory.hooks.resolve.tap('resolve', (resolve) => {
          console.log('resolve');
        });

        normalModuleFactory.hooks.module.tap('module', (module) => {
          console.log('module', module.resource);
        });

        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap('parser', (parser) => {
            console.log('parser');
            // console.log(Object.keys(parser.hooks));

            parser.hooks.import.tap('import', (statement, source) => {
              console.log('import');
              //   console.log('statement', statement);
              //   console.log('source', source);
            });
            parser.hooks.finish.tap('finish', () => {
              console.log('finish');
            });
          });
      }
    );
  }
}

module.exports = ZipPlugin;

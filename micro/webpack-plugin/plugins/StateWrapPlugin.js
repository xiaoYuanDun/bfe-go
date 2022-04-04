/**
 * 1. 为匹配到的文件添加 xxx 内容
 *    在输出文件前，拦截，并添加自定义内容
 * 2. 输出 .md 文档，说明包装情况
 * 3. 动态进入改进
 *    import Xxx from '@/components/xxx';
 *    const config = {
 *      component: Xxx
 *    }
 *    --->
 *    1. 检查 import，有 @/Component/... 的，记录引用地址，组件名，删除
 *    2. 添加一个新源码：const {组件名} = React.lazy(() => import({引用地址}))
 *
 *
 * compilation.options 可以拿到所有的 webpack 配置信息
 *
 *
 * -----------------------------------------------------------------------------
 * 问题：
 *   1. 通过 _valueAsString 改变源码后，如何更新对应的 source-map 文件？
 *
 */

class StateWrapPlugin {
  // pathReg，匹配何种文件
  // version，包装版本
  constructor(opts = {}) {
    this.opts = opts;
    console.log(opts);
  }

  cleanDist() {
    console.log('清理 dist 目录');
    console.log('this. ', this);
  }

  apply(compiler) {
    // import { wrapperModel } from '@sugo/hooks'
    // export const { model, useCommit, useModelState, useLoading } = wrapperModel(myModel)

    compiler.hooks.thisCompilation.tap('StateWrapPlugin', (compilation) => {
      compilation.hooks.succeedModule.tap('StateWrapPlugin', (module) => {
        // console.log('module', module);
      });
      compilation.hooks.finishModules.tapAsync(
        'StateWrapPlugin',
        (modules, cb) => {
          console.log('共构建了 ' + modules.length + '个模块');

          const { pathReg = '/store/' } = this.opts;

          modules.forEach((module) => {
            // todo，替换为路径表达式
            if (!!~module.request.indexOf(pathReg)) {
              console.log(module);
            }
          });

          cb();
        }
      );
    });

    return;
    compiler.hooks.done.tap('StateWrapPlugin', (stat) => {
      console.log('stat ---------', stat.hash);
    });

    compiler.hooks.run.tap('StateWrapPlugin', () => {
      compiler.hooks.compilation.tap('StateWrapPlugin', (compilation) => {
        console.log('compilation ---------------------------------');
      });
      compiler.hooks.thisCompilation.tap('StateWrapPlugin', (compilation) => {
        console.log('thisCompilation ---------------------------------');
      });
      compiler.hooks.compile.tap('StateWrapPlugin', (compilation) => {
        console.log('compile ---------------------------------');
      });

      return;
      //
      compiler.hooks.thisCompilation.tap('StateWrapPlugin', (compilation) => {
        // console.log('config', compilation.options);

        compilation.hooks.buildModule.tap('StateWrapPlugin', (module) => {
          // console.log('module', module);
        });

        compilation.hooks.finishModules.tap('StateWrapPlugin', (modules) => {
          // console.log('length', modules.length);
          // console.log(modules);
        });
      });

      compiler.hooks.emit.tapAsync('StateWrapPlugin', (compilation, cb) => {
        console.log(Object.keys(compilation.assets));
        cb();
      });
    });
  }
}

module.exports = StateWrapPlugin;

// https://webpack.wuhaolin.cn/5%E5%8E%9F%E7%90%86/5-4%E7%BC%96%E5%86%99Plugin.html

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { Compilation } = require('webpack');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

function MegerRouterPlugin(options) {
  // options是配置文件，你可以在这里进行一些与options相关的工作
}

MegerRouterPlugin.prototype.apply = function (compiler) {
  // 注册 before-compile 钩子，触发文件合并
  compiler.plugin('before-compile', (compilation, callback) => {
    // 最终生成的文件数据
    const data = {};
    const routesPath = resolve('src/routes');
    const targetFile = resolve('src/router-config.js');
    // 获取路径下所有的文件和文件夹
    const dirs = fs.readdirSync(routesPath);
    try {
      dirs.forEach((dir) => {
        const routePath = resolve(`src/routes/${dir}`);
        // 判断是否是文件夹
        if (!fs.statSync(routePath).isDirectory()) {
          return true;
        }
        delete require.cache[`${routePath}/index.js`];
        const routeInfo = require(routePath);
        // 多个 view 的情况下，遍历生成router信息
        if (!_.isArray(routeInfo)) {
          generate(routeInfo, dir, data);
          // 单个 view 的情况下，直接生成
        } else {
          routeInfo.map((config) => {
            generate(config, dir, data);
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    // 如果 router-config.js 存在，判断文件数据是否相同，不同删除文件后再生成
    if (fs.existsSync(targetFile)) {
      delete require.cache[targetFile];
      const targetData = require(targetFile);
      if (!_.isEqual(targetData, data)) {
        writeFile(targetFile, data);
      }
      // 如果 router-config.js 不存在，直接生成文件
    } else {
      writeFile(targetFile, data);
    }

    // 最后调用 callback，继续执行 webpack 打包
    callback();
  });
};
// 合并当前文件夹下的router数据，并输出到 data 对象中
function generate(config, dir, data) {
  // 合并 router
  mergeConfig(config, dir, data);
  // 合并子 router
  getChildRoutes(config.childRoutes, dir, data, config.url);
}
// 合并 router 数据到 targetData 中
function mergeConfig(config, dir, targetData) {
  const { view, models, extraModels, url, childRoutes, ...rest } = config;
  // 获取 models，并去除 src 字段
  const dirModels = getModels(`src/routes/${dir}/models`, models);
  const data = {
    ...rest,
  };
  // view 拼接到 path 字段
  data.path = `${dir}/views${view ? `/${view}` : ''}`;
  // 如果有 extraModels，就拼接到 models 对象上
  if (dirModels.length || (extraModels && extraModels.length)) {
    data.models = mergerExtraModels(config, dirModels);
  }
  Object.assign(targetData, {
    [url]: data,
  });
}
// 拼接 dva models
function getModels(modelsDir, models) {
  if (!fs.existsSync(modelsDir)) {
    return [];
  }
  let files = fs.readdirSync(modelsDir);
  // 必须要以 js 或者 jsx 结尾
  files = files.filter((item) => {
    return /\.jsx?$/.test(item);
  });
  // 如果没有定义 models ，默认取 index.js
  if (!models || !models.length) {
    if (files.indexOf('index.js') > -1) {
      // 去除 src
      return [`${modelsDir.replace('src/', '')}/index.js`];
    }
    return [];
  }
  return models.map((item) => {
    if (files.indexOf(`${item}.js`) > -1) {
      // 去除 src
      return `${modelsDir.replace('src/', '')}/${item}.js`;
    }
  });
}
// 合并 extra models
function mergerExtraModels(config, models) {
  return models.concat(config.extraModels ? config.extraModels : []);
}
// 合并子 router
function getChildRoutes(childRoutes, dir, targetData, oUrl) {
  if (!childRoutes) {
    return;
  }
  childRoutes.map((option) => {
    option.url = oUrl + option.url;
    if (option.childRoutes) {
      // 递归合并子 router
      getChildRoutes(option.childRoutes, dir, targetData, option.url);
    }
    mergeConfig(option, dir, targetData);
  });
}

// 写文件
function writeFile(targetFile, data) {
  fs.writeFileSync(
    targetFile,
    `module.exports = ${JSON.stringify(data, null, 2)}`,
    'utf-8'
  );
}

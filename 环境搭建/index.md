### webpack, React 集成

- 首先初始化 package.json,  安装  webpack  相关包

```
yarn init -y
yarn add webpack, webpack-cli -D
```

- 新建并配置 webpack.config.js，package.json
  webpack  是基于  node  开发的,  需要使用  commonJS  模块规范(module.exports)
  mode 指定当前模式 (development / production)
  entry 指定编译入口
  output 编译结果输出配置(filename 为打包后的文件名, path 是打包后的文件路径，这里使用 \_\_dirname 构成绝对路径)

```
//  -->  webpack.config.js

const path = require("path");
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../dist"),
  },
};

//  -------

//  -->  package.json

{
  "name": "webpack-test",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "build": "webpack --config ./config/webpack.config.js"
  },
  "devDependencies": {
    "webpack": "^4.44.2",
    "webpack-cli": "^3.3.12"
  }
}
```

##### 到这里一个最简单的框架已搭建好, 可以在 src 中编辑文件，使用 `npm run build` 或 `yarn build` 编译文件，编译结果可以在项目根目录的 `./dist` 中查看使用 `npm webpack` 或 `npm run ...`(自定义脚本, 在 package.json 中定义)

##### 不过这个框架基本支持不了实际开发，只是用来展示一下 webpack 的基本配置，下面继续扩展

- 一般项目中会有一个单独的 config 文件夹, webpack.config.js , webpack.config.dev.js , webpack.config.prod.js 等，注意放入 config 之后，配置文件中部分 path 属性需要同步调整

- 接下来我们继续配置 模板插件，这个比较简单，这里不介绍了，直接安装配置即可，一般直接使用默认即可，如果需要使用自己的模板也可以在配置中指定 [插件传送门](https://webpack.docschina.org/plugins/html-webpack-plugin/)

```
yarn add html-webpack-plugin -S 
```

```
//  -->  webpack.config.js
plugins: [
    new HtmlWebpackPlugin({
      //  模板位置
      template: path.resolve(__dirname, "..template/index.html"),
      //  输出名
      filename: "index.html",
      //  是否压缩模板
      minify: true,
      hash: true,
    }),
  ]
```

- 配置开发服务器，可以帮助我们启动一个开发服务器，自动进行文件变更重载等操作，不用我们在每次更新文件后手动 build。要配置它，首先安装相关模块 [devServer 资料传送门](https://webpack.docschina.org/guides/development/#using-webpack-dev-server)，[webpack-dev-server 具体配置项](https://github.com/webpack/webpack-dev-server)

```
yarn add webpack-dev-server -D
```

```
//  -->  webpack.config.js
devServer: {
    port: 3000,
    //  是否展示进度条
    progress: true,
    //  静态服务器根路径
    contentBase: path.resolve(__dirname, "../dist"),
}
```

```
//  -->  package.json
  scripts": {
    "dev": "webpack serve --open"
  },
```

- 添加 loader 支持其他模块加载，如 css, less, ts, tsx, 图片 等

```
module: {
    //  所有 loader 规则集合
    rules: [
      {
        test: /\.(less|css)$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
```

- 到这里我们已经配置了一个简单的开发环境，可以自动编译变更，实时更新到指定端口，接下来，我们添加 **React** 语法支持（重点）

- 要使用 React 首先安装相关 npm 包

```
yarn add react react-dom -S
```

- 其次，react 使用的是 jsx 语法，但是目前我们并没有配置相关的支持，这里我们使用 babel-loader 来处理 jsx，先安装他依赖的包 [webpack 官网中 babel-loader 介绍](https://webpack.docschina.org/loaders/babel-loader/)，[@babel/preset-react 预设](https://www.babeljs.cn/docs/babel-preset-react)(这里说一下，**预设**的概念相当于把很多 babel 转换插件打包在一起，比如要转换箭头函数需要一个插件，我们要装依赖，转换类的写法需要安装一个专门的插件，我们也要单独安装，当我们需要许多转换插件时，一个个写就很麻烦，这是可以使用预设的插件集合一次性安装)

  `babel-loader` 要使用的 loader

  `@babel/core` 核心模块已被分离成单独的包

  `@babel/preset-react` 预设的和 react 相关的设置

  `@babel/preset-env` 预设高级语法转换插件

```
yarn add babel-loader @babel/core @babel/preset-env -D
```

- 同时还需要添加 babel 的配置文件，这里我们使用 `babel-config.json` 命名 [配置传送门](https://www.babeljs.cn/docs/configuration)，`presets` 是逆序排列的，所以这里会先使用 react 相关插件，再使用 env 相关插件

```
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

- 然后需要告诉 `webpack` 使用新的 `loader` 来处理 `js` 和 `jsx` 文件，添加 `webpack.config.js` 配置如下

```
//  -->  webpack.config.js
module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  }
```

- 这是我们应该可以使用 `import xxx from xxx.js/jsx` 来引用组件了，但是每次引入都要加后缀，很冗余，所以这里添加一个配置来处理后缀问题 [官方参考](https://webpack.docschina.org/configuration/resolve/#resolveextensions)

```
//  --> webpack.config.js
resolve: {
    //  可以继续添加其他你需要省略的后缀
    extensions: ['.js', '.jsx'],
}
```

- 到这里，一个基础的 `react` 环境基本完成，不过 `babel` 只转换新的`js`语法，不会转换新的`API`，如 `Iteratre`，`Promise` 等。所以我们还需要解决这个问题，关于 polyfill 和 runtime 的一些[资料](https://www.babeljs.cn/docs/babel-polyfill)，babel 做语法转换是自己实现的 helper，但是做 polyfill 都不是自己实现的，而是借助了第三方的 corejs、regenerator
  `@babel/polyfill` 正是用来解决这个问题的，它对这些当前环境没有实现的方法做了处理，不过它会污染全局变量，且因为他会打包整个依赖包，所以会导致产物体积变大，所以这个方式在 babel7.4 被废弃了

  `core-js` 是从原来的 `@babel/polyfill` 拆出来的核心模块，现在单独使用它，同时配合`@babel/presets-env` 的`useBuiltIns`配置，可以实现更细粒度的按需引入，具体看 [useBuiltIns 官方参考](https://www.babeljs.cn/docs/babel-preset-env#usebuiltins)

  `@babel/plugin-transform-runtime` babel 在构建过程中会使用一些帮助方法 `helper`，这些方法在每个文件中都会重复，这明显是冗余的，所以出现了这个包，用来统一引用这些通用的`helper`，这样就避免了重复代码的产生，同时这个运行时会被打包进最终的产物，并且使用 `runtime` 的另一个优势是，他不会产生全局的污染变量，而是为每个环境创造一个沙盒环境。有一个需要注意的地方，`runtime` 的开发/运行 的依赖包不同，开发环境使用 `@babel/plugin-transform-runtime`，生产环境使用`@babel/runtime`

  一些资料：[一个比较详细的 blog](https://blog.liuyunzhuge.com/2019/09/04/babel%E8%AF%A6%E8%A7%A3%EF%BC%88%E4%BA%94%EF%BC%89-polyfill%E5%92%8Cruntime/)

- 我们这里安装依赖

```
yarn add @babel/runtime core-js -S
yarn add @babel/plugin-transform-runtime
```

- 调整`babel`配置文件，`useBuiltIns: usage` 用于对`core-js`中的 polyfll 进行按需加载，因为当前使用了 `babel7.4` 版本，所以 `corejs` 使用 **3**，然后引入运行时插件即可

```
//  --> babel.config.json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": "3"
      }
    ],
    "@babel/preset-react"
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

- 到这里基本上就支持了所有的高级语法，下一步继续集成 `typescript`

### 集成 TS

-  要使用  `typescript`，首先安装依赖，然后进行  ts  配置  [webpack  官方文档的  ts  介绍](https://webpack.docschina.org/guides/typescript/), [官方推荐的几种配置](https://github.com/tsconfig/bases), [tsconfig  官方介绍](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), [tsconfig  官中](https://www.typescriptlang.org/zh/docs/handbook/tsconfig-json.html), [最重要的  compilerOptions  配置](https://www.typescriptlang.org/tsconfig)

```
yarn add typescript -D
```

-  这里的  `tsconfig`  内容其实是官方推荐的配置,

```
//  -->  tsconfig.json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Recommended"
}
```

-  也可以直接通过  `extends`  关键字来取值

```
yarn add @tsconfig/recommended -D
```

```
//  -->  tsconfig.json
{
  "extends": "@tsconfig/recommended/tsconfig.json"
}
```

- 或者通过 `tsc --init` 生成一个默认的配置文件

- 同时，我们还是使用 `babel` 进行 `.ts` 和`.tsx` 文件的转化，所以我们安装预制 ts 插件

```
yarn add @babel/preset-typescript
```

- 添加 `babel.config.json` 配置，修改`webpack.config.js` 配置

```
//  -->  babel.config.json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": "3"
      }
    ],
    "@babel/preset-react"，
    "@babel/preset-typescript"
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

```
//  --> webpack.config.js
module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  }
entry: './src/index.tsx',
resolve: {
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
},
```

- 到这里就成功集成`typescript`了，完整配置看一下`ts-react`子目录，接下来我们继续完善代码规范，通过`eslint`

### eslint 集成

### 参考资料

**大部分资料还是官方资料比较准确，多看看吧**
[webpack 官方文档](https://webpack.docschina.org/concepts/)
[一篇 babel 介绍](https://juejin.cn/post/6844904008679686152)
[搭建参考\_01](https://www.freecodecamp.org/news/learn-webpack-for-react-a36d4cac5060/)
[搭建参考\_02](https://www.robinwieruch.de/minimal-react-webpack-babel-setup#react-with-webpack)

[ts 搭建参考\_03](https://juejin.cn/post/6860134655568871437#heading-3)

# 源码学习

下载 TS 源码后, 首先看 package.json 文件, 可以看到其对外暴露的两个命令:

```js
"bin": {
    "tsc": "./bin/tsc",
    "tsserver": "./bin/tsserver"
},
```

这次主要是记录一下如何编译 ts 源码, 如何进行调试, 包括 TS 是如何使用 gulp 来帮助构建产物的

### gulp 使用

定义 gulpFile 文件后, 可以通过 `gulp` 命令运行, 但是需要一个默认导出, 如:

```js
function defaultTask(cb) {
  // place code for your default task here
  cb();
}

function build(cb) {
  // body omitted
  cb();
}

exports.build = build;
exports.default = defaultTask;
```

在运行 `gulp` 命令后, 会直接运行这个默认导出的方法, 运行 `gulp build` 后会执行 build 方法, 同时还可以使用 gulp 自带的 API: `task` 来定义方法, 写法如下:

```js
const { task } = require('gulp');

task('default', function (cb) {
  // body omitted
  cb();
});

task('build', function (cb) {
  // body omitted
  cb();
});
```

这种写法和上面的写法是能达到同样的效果的, 只不过官方更推荐上面那种显示导出的方式, 但是 TS 源码中的 gulp 配置文件是使用下面这种写法的

这里不详细探究 gulp, 看一下编译命令:

```js
task(
  'local',
  series(
    preBuild,
    parallel(
      localize,
      buildTsc,
      buildServer,
      buildServices,
      buildLssl,
      buildOtherOutputs
    )
  )
);
task('local').description = 'Builds the full compiler and services';
task('local').flags = {
  '   --built': 'Compile using the built version of the compiler.',
};
```

可以很清除的看到 local 的方法定义, 都由哪些子方法构成, 执行顺序是怎样的

### 编译源码

安装完依赖后, 直接使用命令 `yarn build:compiler` 得到构建产物, 路径是 `built/local/**`

在 `built/local/tsc.js` 文件结尾处, 有这么一句代码

```js
//# sourceMappingURL=tsc.js.map
```

这是连接编译文件和源码的关键, 有了 `tsc.js.map` 文件, 就可以对编译产物进行 debug 了

### ast

针对如下 TS 类型, 对其进行 ast 解析:

```ts
// test1.ts
type Test<T> = T extends string ? 'Y' : 1;
```

遍历它的 node.kind 可以的到:

```js
node 303
node 258
node 79
node 162
node 79
node 188
node 177
node 79
node 149
node 195
node 10
node 195
node 8
node 1
```

每个数字都是什么含义呢? 我们可以在 `build/local/typescript.d.ts` 中找到定义, **(这里只关注出现的几个类型, 并且当前调试版本是 4.5.0, 不同版本的 kind 枚举值可能会有出入)**

303: SourceFile, 标识整体源文件, 这里指 `test1.ts`
258: TypeAliasDeclaration, 类型定义标识, 这里指 `type Test<T> = T extends string ? 'Y' : 1;`
79: Identifier, 声明标识符, 这里指 `Test`
162: TypeParameter, 泛型标识符, 这里指 `Test<T>` 中的 `T`
79, 这里二次出现的声明标识符, 是 `T` 的声明
188, ConditionalType, 条件类型标识符, 表示整个条件类型包含的语句, 这里指 `T extends string ? 'Y' : 1`, 这里多说一点, 因为一个 `ConditionalType` 内会包含 4 个变量, 分别是 `checkType`, `extendsType`, `trueType`, `falseType`, 分别表示上面的 `T`, `string`, `'Y'`, `1`
177, TypeReference, 类型引用标识, 因为这里无法确定具体类型, 依赖于 T 传入的类型, 所以他表示一个变量引用
79, 这里出现的声明标识符, 是 `T` 的声明
149, StringKeyword, 字符串关键字标识, 这里指 `T extends string ? 'Y' : 1` 中的 `string`
195, LiteralType, 常量标识, 表示当前 node 是一个常量
10, StringLiteral, 字符串常量标识, 这里指 `T extends string ? 'Y' : 1` 中的 `'Y'`
195, 和上面一样
8, NumericLiteral, 数字类型常量标识, 这里指 `T extends string ? 'Y' : 1` 中的 `1`
1, EndOfFileToken, 文件结束标识

通过分析它的 ast 结构和顺序, 可以知道, TS 是如何读取我们使用的类型的, 我们接下来通过 **分布式条件类型** 语法来一步步 debug 它的执行流程

### todo ts 整体代码还不熟悉

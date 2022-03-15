### 关于 sourcemap

sourcemap 用于生成关联源码和编译后代码的 map 文件，通常开发和生成的生成准则也不同

可以使用 devtool 来做简单控制
也可以用相关插件，诸如 sourcemapdevplugin 做更细粒度的控制

---

- [sourcemap 是什么](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

- 大部分源码都经过了工程化处理，导致产物和源码有较大的区别，无法进行 debug

- 要使用 sourcemap，需要在末尾添加对应的 map 文件

  ```js
  //@ sourceMappingURL=/path/to/file.js.map
  ```

- 源码经过丑化压缩后，行数列数可能会发生很大的变化，这时，就可能通过 source-map 中的 `mappings` 信息来做两者的关联

- `mappings` 以 `;` 来分割转换后的源码，每一个 `;` 前的内容就对应一刚转换后的源码（产物，丑化压缩后的）；每段子内容中，又用 `,` 进行分割，每个 `,` 表示转换后的源码的一个位置，比如：

  ```js
  // mappings: 'AAAAA,BBBBB;CCCCC';
  // 表示转换后的源码有两行，第一行有两个位置描述，第二行有一个
  ```

- 来看看每个字段的含义，从左向右算起：
  第一位，表示这个位置在（转换后的代码的）的第几列。
  第二位，表示这个位置属于 sources 属性中的哪一个文件。
  第三位，表示这个位置属于转换前代码的第几行。
  第四位，表示这个位置属于转换前代码的第几列。
  第五位，表示这个位置属于 names 属性中的哪一个变量

- 另外可以在 micro/webpack-test, 执行 `yarn build` 查看 webpack 生成的 source-map 是什么样的，也可参考这篇[文章](https://segmentfault.com/a/1190000008315937)

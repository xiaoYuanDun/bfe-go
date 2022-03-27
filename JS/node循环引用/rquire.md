### require 全过程

- 在 node 中，每一个文件模块都是一个 Module 的实例

- 每个 Module 实例都可以调用 require 方法，此方法已经通过调用被注入到每个文件中

- require 实际调用的是 _load 方法

```js
Module.prototype.require = function(path) {
  return Module._load(path, this);
};

Module._load = function(request, parent, isMain) {
    
  // 根据 ke 计算出当前模块的的绝对路径
  // 在此方法中，会得到所有可能的 path 集合（从当前绝对路径的 node_module 文件夹下开始，向父级目录递归）
  // 如下所示，
  // [   
  //   '/home/ruanyf/tmp/node_modules',
  //   '/home/ruanyf/node_modules',
  //   '/home/node_modules',
  //   '/node_modules' 
  //   '/home/ruanyf/.node_modules',
  //   '/home/ruanyf/.node_libraries'，
  //    '$Prefix/lib/node' 
  // ]
  // 然后从每个路径中寻找是否存在 x, x.js, x.json, x.node, x/package.json, x/index.js, x/index.json, x/index.node, 满足任意一个条件，就会返回
  var filename = Module._resolveFilename(request, parent);

  //  第一步：如果有缓存，取出缓存
  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    return cachedModule.exports;

  // 第二步：是否为内置模块
  if (NativeModule.exists(filename)) {
    return NativeModule.require(filename);
  }

  // 第三步：生成模块实例，存入缓存
  var module = new Module(filename, parent);
  Module._cache[filename] = module;

  // 第四步：加载模块
  try {
    // 会在这里注入 require, module 等变量
    module.load(filename);
    hadException = false;
  } finally {
    if (hadException) {
      delete Module._cache[filename];
    }
  }

  // 第五步：输出模块的exports属性
  return module.exports;
}

// 这里的 filename 是绝对路径
Module.prototype.load = function(filename) {
  var extension = path.extname(filename) || '.js';
  if (!Module._extensions[extension]) extension = '.js';
  Module._extensions[extension](this, filename);
  this.loaded = true;
};
```

- 
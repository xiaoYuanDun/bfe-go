function loader(source) {
  // 参数就是代码
  console.log('logger-2')
  return source + '// 2'
}

module.exports = loader

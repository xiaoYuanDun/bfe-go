function loader(source) {
  // 参数就是代码
  console.log('logger-1')
  return source + '// 1'
}

module.exports = loader

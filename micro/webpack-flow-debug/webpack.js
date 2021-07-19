const Compiler = require('./Compiler')

function webpack(options) {
  // 1. 初始化参数：从配置文件和 Shell 语句中读取并合并参数,得出最终的配置对象
  const shellConfig = process.argv.slice(2).reduce((shellConfig, item) => {
    const [key, value] = item.split('=')
    shellConfig[key.slice(2)] = value
    return shellConfig
  }, {})
  let finalConfig = { ...options, ...shellConfig }
  console.log(finalConfig)
  // 2. 用上一步得到的参数初始化 Compiler 对象
  let compiler = new Compiler()
}

module.exports = webpack
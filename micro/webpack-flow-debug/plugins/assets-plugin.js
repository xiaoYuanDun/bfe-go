class AssetsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('AssetsPlugin', (assets) => {
      assets['readme.md'] = Object.keys(assets).join('-\n')
    })
  }
}

module.exports = AssetsPlugin

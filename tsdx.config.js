module.exports = {
  rollup(config, options) {
    if (config.output.format === 'umd') {
      config.external = []
    }

    return config
  },
}

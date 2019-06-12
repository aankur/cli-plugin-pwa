const ID = 'vue-cli:pwa-html-plugin'

const defaults = {
  assetsVersion: '',
  manifestPath: 'manifest.json',
  manifestCrossorigin: undefined
}

const defaultIconPaths = {
}

module.exports = class HtmlPwaPlugin {
  constructor (options = {}) {
    const iconPaths = Object.assign({}, defaultIconPaths, options.iconPaths)
    delete options.iconPaths
    this.options = Object.assign({ iconPaths: iconPaths }, defaults, options)
  }

  apply (compiler) {
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync(ID, (data, cb) => {
        // wrap favicon in the base template with IE only comment
        data.html = data.html.replace(/<link rel="icon"[^>]+>/, '<!--[if IE]>$&<![endif]-->')
        cb(null, data)
      })

      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, (data, cb) => {
        const {
          name,
          themeColor,
          msTileColor,
          appleMobileWebAppCapable,
          appleMobileWebAppStatusBarStyle,
          assetsVersion,
          manifestPath,
          iconPaths,
          manifestCrossorigin
        } = this.options
        const { publicPath } = compiler.options.output

        const assetsVersionStr = assetsVersion ? `?v=${assetsVersion}` : ''

        data.head.push(
          // Add to home screen for Android and modern mobile browsers
          makeTag('link', manifestCrossorigin
            ? {
              rel: 'manifest',
              href: `${publicPath}${manifestPath}${assetsVersionStr}`,
              crossorigin: manifestCrossorigin
            }
            : {
              rel: 'manifest',
              href: `${publicPath}${manifestPath}${assetsVersionStr}`
            }
          )
        )

        cb(null, data)
      })
    })
  }
}

function makeTag (tagName, attributes, closeTag = false) {
  return {
    tagName,
    closeTag,
    attributes
  }
}

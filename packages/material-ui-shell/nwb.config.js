const path = require('path')

module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false,
  },
  webpack: {
    /*
    html: {
      template: 'demo/public/index.html',
    },
    */
    aliases: {
      'material-ui-shell/lib': path.resolve('src'),
    },
  },
}

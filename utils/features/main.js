const { app } = require('electron')

const features = [
      'FluentOverlayScrollbars',
]

if (process.platform === 'win32') {
      features.push('WindowsScrollingPersonality')
}

exports.appendFeatures = function appendFeatures() {
      app.commandLine.appendSwitch('enable-features', features.join(','))
}
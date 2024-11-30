const { app } = require('electron')

const features = [
    'FluentOverlayScrollbars',
]

/**
 * 由于 m130 弃用了 `WindowsScrollingPersonality`, 所以这个功能在以后的版本中都可能不会再有
 * @link https://issues.chromium.org/issues/359747082
 */
// if (process.platform === 'win32') {
//     features.push('WindowsScrollingPersonality')
// }

exports.appendFeatures = function appendFeatures() {
    app.commandLine.appendSwitch('enable-features', features.join(','))
}
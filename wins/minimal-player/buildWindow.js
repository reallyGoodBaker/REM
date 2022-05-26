const {BrowserWindow} = require('electron')
const path = require('path')

function createMinimalPlayer() {
    const win = new BrowserWindow({
        width: 400,
        height: 160,
        frame: false,
        resizable: false,

        webPreferences: {
            preload: path.resolve(__dirname, './preload.js'),
        }
    })

    win.loadFile(path.resolve(__dirname, './ui.html'))
    win.setSkipTaskbar(true)

    return win
}

module.exports = createMinimalPlayer
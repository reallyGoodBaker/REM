const { BrowserWindowConstructorOptions, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

const defaultOptions = {
    webPreferences: {
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, './win-inject.js')
    }
}

/**
 * @param {BrowserWindowConstructorOptions} options 
 */
function openWindow(file, options, manifest) {
    const extra = options.extra ?? {}

    if (manifest.components.includes('replace_main_window') && extra.replaceMain) {
        BrowserWindow.getAllWindows()[0].hide()
    }

    const win = new BrowserWindow(Object.assign({}, options, defaultOptions))
    win.webContents.executeJavaScript(`win.init(globalThis.winId=${win.id})`)

    if (extra.main) {
        eval(`(function(browserWindow){\n${fs.readFileSync(extra.main).toString()}\n})(win)`)
    }

    if (extra.openDevTools) {
        win.webContents.openDevTools({ mode: 'detach' })
    }

    win.loadFile(file)

    if (extra.shared) {
        win.webContents.executeJavaScript(`win.shared(globalThis.shared=${JSON.stringify(extra.shared)})`)
    }

    win.on('close', () => {
        win.webContents.executeJavaScript('win.beforeClose()')
        if (extra.replaceMain) {
            BrowserWindow.getAllWindows()[0].show()
        }
    })

    return win.id
}

function destroyWindow(id) {
    /**@type {BrowserWindow}*/
    const win = BrowserWindow.fromId(id)

    if (win) {
        win.destroy()
    }
}

function closeWindow(id) {
     /**@type {BrowserWindow}*/
     const win = BrowserWindow.fromId(id)

     if (win) {
        win.close()
     }
}

module.exports = {
    openWindow, destroyWindow, closeWindow,
}
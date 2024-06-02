const { BrowserWindowConstructorOptions, BrowserWindow } = require('electron')
const path = require('path')
const initInvoker = require('../../utils/main-invoker/node')
const { record, deleteRecord } = require('../../utils/ipc/extmapping')
const { Extensions } = require('../../utils/appPath/main')

const defaultOptions = {
    webPreferences: {
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, './win-inject.js')
    }
}

function tryInvoke(obj, func, ...args) {
    const fn = obj[func]
    if (fn && fn.apply) {
        fn.apply(obj, args)
    }
}

const activeWindows = new Set()
/**
 * @param {BrowserWindowConstructorOptions} options 
 */
function openWindow(winName, options, manifest) {
    if (!manifest.windows || activeWindows.has(winName)) {
        return -1
    }

    const extra = manifest.windows[winName] ?? {}
    const pluginRoot = path.join(Extensions, manifest.folderName)

    if (manifest.components.includes('replace_main_window') && extra.replaceMain) {
        BrowserWindow.getAllWindows()[0].hide()
    }

    const win = new BrowserWindow(Object.assign({}, options, defaultOptions))
    const invoker = initInvoker(win)
    win.webContents.executeJavaScript(`win.init(globalThis.winId=${win.id})`)

    const winMain = path.join(pluginRoot, extra.main)

    record(win.id, manifest.id)
    activeWindows.add(winName)

    if (extra.main) {
        const m = require(winMain)
        tryInvoke(m, 'onReady', win, invoker)
    }

    if (extra.openDevTools) {
        win.webContents.openDevTools({ mode: 'detach' })
    }

    win.loadFile(path.join(pluginRoot, extra.renderer))
    win.on('close', () => {
        if (extra.main) {
            const m = require(winMain)
            tryInvoke(m, 'onClose', win, invoker)
        }

        win.webContents.executeJavaScript('win.beforeClose()')
        if (extra.replaceMain) {
            BrowserWindow.getAllWindows()[0].show()
        }

        deleteRecord(win.id)
        activeWindows.delete(winName)
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
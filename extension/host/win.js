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

/**@type {Map<string, BrowserWindow>}*/
const activeWindows = new Map()
/**
 * @param {BrowserWindowConstructorOptions} options 
 */
function hasWindow(winName) {
    const win = activeWindows.get(winName)
    return win && !win.isDestroyed()
}

function openExtensionWindows(manifest) {
    if (!manifest.windows || !manifest.folderName) {
        return
    }

    for (const [ winName, extra ] of Object.entries(manifest.windows)) {
        if (extra.replaceMain) {
            continue
        }

        const options = {
            show: true,
            backgroundColor: '#99000000',
            ...extra.openOptions ?? {},
        }

        if (!hasWindow(winName)) {
            try {
                const winId = openWindow(winName, options, manifest)
                console.log(`[extension:${manifest.name}] open "${winName}" -> window id ${winId}`)
            } catch (err) {
                console.error(`[extension:${manifest.name}] failed to open "${winName}":`, err)
            }
        }
    }
}

function closeExtensionWindows(manifest) {
    if (!manifest.windows) {
        return
    }

    for (const winName of Object.keys(manifest.windows)) {
        const win = activeWindows.get(winName)
        if (win && !win.isDestroyed()) {
            win.close()
        }
    }
}

function openFallbackWindows(manifest) {
    if (!manifest.windows) {
        return
    }

    for (const [ winName, extra ] of Object.entries(manifest.windows)) {
        if (extra.replaceMain) {
            continue
        }

        const options = {
            show: true,
            backgroundColor: '#99000000',
            ...extra.openOptions ?? {},
        }

        setTimeout(() => {
            if (!hasWindow(winName)) {
                openWindow(winName, options, manifest)
            }
        }, 600)
    }
}

function openWindow(winName, options, manifest) {
    if (!manifest.windows) {
        return -1
    }

    if (activeWindows.has(winName)) {
        const win = activeWindows.get(winName)
        if (!win) {
            activeWindows.delete(winName)
            return -1
        }

        return win.id
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
    activeWindows.set(winName, win)

    if (extra.main) {
        const m = require(winMain)
        tryInvoke(m, 'onReady', win, invoker)
    }

    if (extra.openDevTools) {
        win.webContents.openDevTools({ mode: 'detach' })
    }

    win.loadFile(path.join(pluginRoot, extra.renderer))
    win.show()
    win.on('close', async () => {
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

function resolveWindowId(id) {
    if (id == null || id === '') {
        return -1
    }

    const n = Number(id)
    return Number.isFinite(n) && n >= 0 ? n : -1
}

function destroyWindow(id) {
    const winId = resolveWindowId(id)
    if (winId < 0) {
        return
    }

    /**@type {BrowserWindow}*/
    const win = BrowserWindow.fromId(winId)

    if (win) {
        win.destroy()
    }
}

function closeWindow(id) {
    const winId = resolveWindowId(id)
    if (winId < 0) {
        return
    }

     /**@type {BrowserWindow}*/
     const win = BrowserWindow.fromId(winId)

     if (win) {
        win.close()
     }
}

module.exports = {
    openWindow, destroyWindow, closeWindow, hasWindow,
    openExtensionWindows, closeExtensionWindows, openFallbackWindows,
}
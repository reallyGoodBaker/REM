const {
    BrowserWindow, ipcMain, app, nativeImage, screen,
    Menu,
} = require('electron')
const path = require('path')
const RemStore = require('../../utils/stores/rem-store.js')
const {watchNetworkChange} = require('../../utils/network/server.js')
const {initExtRuntime} = require('../../extension/initExtensionHost')

const remStore = new RemStore()

Menu.setApplicationMenu(null)
watchNetworkChange()


const appLock = app.requestSingleInstanceLock()
if (!appLock) app.exit()

function scaleDisplayProp(num, scale=0.7) {
    return ~~(num * scale)
}

module.exports = function buildWindow() {

    const {width: rawW, height: rawH} = screen.getPrimaryDisplay().bounds

    const width = scaleDisplayProp(rawW),
        height = scaleDisplayProp(rawH, 0.8)

    let browserWindow = new BrowserWindow({
        width,
        height,
        icon: '',
        title: 'rem',
        frame: false,
        backgroundColor: '#d3ece0',
        minWidth: width,
        minHeight: height,

        webPreferences: {
            preload: path.resolve(__dirname, './preload.js'),
        }
    });


    browserWindow.loadFile(path.resolve(__dirname, './index.html'))
    // browserWindow.webContents.openDevTools({ mode: 'detach' })

    browserWindow.on('closed', () => {
        browserWindow = null;
    });

    app.on('second-instance', () => {
        browserWindow.show()
    })

    ipcMain.on('win:title', (_, title) => {
        browserWindow.setTitle(title)
    })

    ipcMain.once('win:show-main', () => {
        if (process.platform === 'win32') {
            setThumbarButtons(browserWindow)
        }

        ipcMain.emit('win:loaded')
    })

    initExtRuntime()
    initMainWin(browserWindow)
    activeAppBarBtns(browserWindow)
    initExtensions(browserWindow)

    browserWindow.show()

    return browserWindow

}

/**
 * @param {BrowserWindow} browserWindow 
 */
function initMainWin(browserWindow) {
    browserWindow.on('maximize', () => {
        browserWindow.webContents.send('win:max')
    })

    browserWindow.on("unmaximize", () => {
        browserWindow.webContents.send('win:unmax', browserWindow.getPosition())
    })

    ipcMain.on('online', () => {
        browserWindow.webContents.send('online')
    })

    ipcMain.on('offline', () => {
        browserWindow.webContents.send('offline')
    })

    ipcMain.on('devtools:close', () => {
        browserWindow.webContents.closeDevTools()
    })

    ipcMain.on('devtools:open', () => {
        browserWindow.webContents.openDevTools({ mode: 'detach' })
    })

    ipcMain.handle('store:get', (_, name) => {
        return remStore.get(name)
    })

    ipcMain.handle('store:getRaw', (_, name) => {
        return remStore.getRaw(name)
    })

    ipcMain.handle('store:set', (_, k, v) => {
        return remStore.set(k, v)
    })

    ipcMain.handle('store:rm', (_, k) => {
        return remStore.rm(k)
    })

    ipcMain.handle('isMac', () => {
        return process.platform === 'darwin'
    })

    ipcMain.on('store:getSync', (ev, k) => {
        ev.returnValue = remStore.get(k)
    })

    browserWindow.on('focus', () => {
        browserWindow.webContents.send('win:focus')
    })

}

/**
 * @param {BrowserWindow} browserWindow 
 */
function activeAppBarBtns(browserWindow) {
    ipcMain.on('win:close', () => {
        browserWindow.close()
    })

    ipcMain.on('win:min', () => {
        browserWindow.minimize()
    })

    ipcMain.on('win:max', () => {
        browserWindow.maximize()
    })

    ipcMain.on('win:unmax', () => {
        browserWindow.unmaximize()
    })

    ipcMain.on('winquery:bounds', ev => {
        ev.sender.send('win:bounds', browserWindow.getBounds())
    })

    ipcMain.on('winquery:screenSize', ev => {
        ev.sender.send('win:screenSize', screen.getPrimaryDisplay().bounds)
    })

    browserWindow.on('will-move', (_, bounds) => {
        browserWindow.webContents.send('pos-change', bounds)
    })

}

function setThumbarButtons(win) {

    const playIcon = nativeImage.createFromPath(path.resolve(__dirname, '../icons/play.png')),
        pauseIcon = nativeImage.createFromPath(path.resolve(__dirname, '../icons/pause.png')),
        preIcon = nativeImage.createFromPath(path.resolve(__dirname, '../icons/previous.png')),
        nextIcon = nativeImage.createFromPath(path.resolve(__dirname, '../icons/next.png'))

    const preBtn = {
        icon: preIcon,
        click() {
            win.webContents.send('player:previous')
        }
    },
        nextBtn = {
            icon: nextIcon,
            click() {
                win.webContents.send('player:next')
            }
        },
        playBtn = {
            icon: playIcon,
            click: onPlayBtn
        },
        pauseBtn = {
            icon: pauseIcon,
            click: onPauseBtn
        },
        playBtns = [preBtn, playBtn, nextBtn],
        pauseBtns = [preBtn, pauseBtn, nextBtn]

    function onPlayBtn() {
        win.webContents.send('player:play')
    }

    function onPauseBtn() {
        win.webContents.send('player:pause')
    }

    function setPlay() {
        win.setThumbarButtons(playBtns)
    }

    function setPause() {
        win.setThumbarButtons(pauseBtns)
    }

    ipcMain.on('thumbar:play', setPlay)
    ipcMain.on('thumbar:pause', setPause)

    win.setThumbarButtons(playBtns)
}


const {loaderBuilder} = require('../../extension/host/loader')
const {Extensions} = require('../../utils/appPath/main')

/**
 * @param {BrowserWindow} bw 
 */
function initExtensions(bw) {
    const loader = loaderBuilder(bw)

    loader(path.resolve(__dirname, '../../extension/vendor'))
    loader(Extensions)
}
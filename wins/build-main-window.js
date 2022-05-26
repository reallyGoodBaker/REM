const {
    BrowserWindow, ipcMain, app, nativeImage, screen, Menu
} = require('electron')
const path = require('path')


Menu.setApplicationMenu(null)


const appLock = app.requestSingleInstanceLock()
if (!appLock) app.exit()


function buildWindow() {
    let browserWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        icon: '',
        minWidth: 860,
        minHeight: 580,
        title: 'rem',
        frame: false,
        backgroundColor: '#d3ece0',

        webPreferences: {
            preload: path.resolve(__dirname, '../preload.js'),
        }
    });

    
    browserWindow.loadFile(path.resolve(__dirname, '../index.html'))
    // browserWindow.webContents.openDevTools()

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
        setThumbarButtons(browserWindow)
    })

    initMainWin(browserWindow)
    activeAppBarBtns(browserWindow)

    browserWindow.show()

    return browserWindow

}

function initMainWin(browserWindow) {
    browserWindow.on('maximize', () => {
        browserWindow.webContents.send('win:max')
    })

    browserWindow.on("unmaximize", () => {
        browserWindow.webContents.send('win:unmax', browserWindow.getPosition())
    })

    ipcMain.on('devtools:close', () => {
        browserWindow.webContents.closeDevTools()
    })

    ipcMain.on('devtools:open', () => {
        browserWindow.webContents.openDevTools()
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
        
    browserWindow.on('will-move', (ev, bounds) => {
        browserWindow.webContents.send('win:screen-move', bounds.x, bounds.y);
    })

}

function setThumbarButtons(win) {

    const playIcon = nativeImage.createFromPath(path.resolve(__dirname, 'icons/play.png')),
        pauseIcon = nativeImage.createFromPath(path.resolve(__dirname, 'icons/pause.png')),
        preIcon = nativeImage.createFromPath(path.resolve(__dirname, 'icons/previous.png')),
        nextIcon = nativeImage.createFromPath(path.resolve(__dirname, 'icons/next.png'))

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
        setPause()
        win.webContents.send('player:play')
    }

    function onPauseBtn() {
        setPlay()
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


module.exports = buildWindow
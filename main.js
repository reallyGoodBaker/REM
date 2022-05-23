const {app, ipcMain, Menu, BrowserWindow, screen, dialog} = require('electron');
const path = require('path');
const fs = require('fs')

Menu.setApplicationMenu(null)


const appLock = app.requestSingleInstanceLock()
if (!appLock) {
    app.exit()
}




function mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}

const
    AppRoot = path.resolve(app.getPath('documents'), 'rem'),
    AppData = path.resolve(AppRoot, 'data'),
    AppCache = path.resolve(AppRoot, 'cache')

mkdir(AppRoot)
mkdir(AppData)
mkdir(AppCache)

//将主要路径写入Path供preload使用
fs.writeFileSync('./Path', `${AppData}\n${AppCache}`)






app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('ready', () => {
    setTimeout(() => {
        buildWindow('./index.html');
    }
        , process.platform == "linux" ? 1000 : 0
    );
});


function buildWindow(filePath='./index.html') {
    let browserWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        icon: '',
        minWidth: 860,
        minHeight: 580,
        title: '',
        frame: false,
        vibrancy: 'light',

        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            
        }
    });

    browserWindow.loadFile(filePath)
    // browserWindow.webContents.openDevTools()

    ipcMain.on('devtools:close', () => {
        browserWindow.webContents.closeDevTools()
    })

    ipcMain.on('devtools:open', () => {
        browserWindow.webContents.openDevTools()
    })

    browserWindow.on('closed', () => {
        browserWindow = null;
    });

    app.on('second-instance', () => {
        browserWindow.show()
    })

    activeAppBarBtns(browserWindow);

    return browserWindow;

}

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

    ipcMain.on('winbind:move', ev => {
        let sender = ev.sender;
        browserWindow.on('will-move', (ev, bounds) => {
            sender.send('win:screenMove', bounds);
        });
        // browserWindow.on('will-resize', (ev, bounds) => {
        //     sender.send('win:screenMove', bounds);
        // });
    })
}

const {createFuncBinding} = require('./utils/api/funcBinder');
const {login, loginViaQRCode, validQRLogin, getUserAccount} = require('./utils/api/login');
const {Search, suggest} = require('./utils/api/search');
const {checkIn} = require('./utils/api/dailySignin');
const {getUserPlaylist, getPlaylistDetail} = require('./utils/api/playlist');
const {getSongDetail, getSongUrl} = require('./utils/api/song');


createFuncBinding(login);
createFuncBinding(Search);
createFuncBinding(suggest);
createFuncBinding(checkIn);
createFuncBinding(getUserPlaylist);
createFuncBinding(getPlaylistDetail);
createFuncBinding(getSongDetail)
createFuncBinding(getSongUrl);
createFuncBinding(loginViaQRCode);
createFuncBinding(validQRLogin);
createFuncBinding(getUserAccount);

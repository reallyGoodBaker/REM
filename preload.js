const { ipcRenderer } = require('electron');
const Binder = require('./utils/jsBinder');
const {createFuncBinding} = require('./utils/api/funcBinder');


new Binder('hooks')
.use({...ipcRenderer,
    on: (...args) => ipcRenderer.on.apply(ipcRenderer, args),
    once: (...args) => ipcRenderer.once.apply(ipcRenderer, args),
    rm: (...args) => ipcRenderer.removeListener.apply(ipcRenderer, args)
});

const {getWallpaper} = require('./utils/Win11Wallpaper');
new Binder('wallpaper').bind('getWallpaper', getWallpaper);



const {login, loginViaQRCode, validQRLogin, getUserAccount} = require('./utils/api/login');
const {Search, suggest} = require('./utils/api/search');
const {checkIn} = require('./utils/api/dailySignin');
const {getUserPlaylist, getPlaylistDetail} = require('./utils/api/playlist');
const {getSongDetail, getSongUrl} = require('./utils/api/song');


new Binder('NeteaseApi')
.bind('login', createFuncBinding(login))
.bind('search', createFuncBinding(Search))
.bind('suggest', createFuncBinding(suggest))
.bind('checkIn', createFuncBinding(checkIn))
.bind('getUserPlaylist', createFuncBinding(getUserPlaylist))
.bind('getPlaylistDetail', createFuncBinding(getPlaylistDetail))
.bind('getSongDetail', createFuncBinding(getSongDetail))
.bind('getSongUrl', createFuncBinding(getSongUrl))
.bind('loginViaQRCode', createFuncBinding(loginViaQRCode))
.bind('validQRLogin', createFuncBinding(validQRLogin))
.bind('getUserAccount', createFuncBinding(getUserAccount))


Binder.bindAll();

const { ipcRenderer } = require('electron');
const Binder = require('./utils/jsBinder');
const {createFuncBinding} = require('./utils/api/funcBinder');
const fs = require('fs')


const {fetchJson} = require('./utils/server/fetch')
const [
    AppData, AppCache
] = fs.readFileSync('./Path').toString().split('\n')

const {saveToCache, getMedia} = require('./utils/server/media-cache')(AppCache)
new Binder('server')
.use({
    fetchJson,
    saveToCache,
    getMedia
})

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
const {getUserPlaylist, getPlaylistDetail, getArtistSublist, getAlbumSublist} = require('./utils/api/playlist');
const {getSongDetail, getSongUrl} = require('./utils/api/song');
const { logout } = require('NeteaseCloudMusicApi');


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
.bind('logout', createFuncBinding(logout))
.bind('getAlbumSublist', createFuncBinding(getAlbumSublist))
.bind('getArtistSublist', createFuncBinding(getArtistSublist))



Binder.bindAll();

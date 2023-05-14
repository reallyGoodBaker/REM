const { ipcRenderer, webFrame } = require('electron')
const Binder = require('../../utils/jsBinder')
const { createFuncBinding } = require('../../utils/api/funcBinder')

const { fetchJson } = require('../../utils/server/fetch')
const { readPath } = require('../../utils/appPath/renderer')
const AppPaths = readPath()

const { AppCache } = AppPaths

new Binder('AppPaths').use(AppPaths)

const {
    saveToCache,
    getMedia,
    saveToPlaylist,
    getPlaylist,
    getMetadata,
} = require('../../utils/server/media-cache')(AppCache)


new Binder('server')
.use({
    fetchJson,
    saveToCache,
    getMedia,
    getPlaylist,
    saveToPlaylist,
    getMetadata,
})

new Binder('hooks')
.use({
    ...ipcRenderer,
    on: (...args) => ipcRenderer.on.apply(ipcRenderer, args),
    once: (...args) => ipcRenderer.once.apply(ipcRenderer, args),
    off: (...args) => ipcRenderer.removeListener.apply(ipcRenderer, args),
    rm: (...args) => ipcRenderer.removeListener.apply(ipcRenderer, args),
    rmAll: (type) => ipcRenderer.removeAllListeners.call(ipcRenderer, type),
    zoom: (ratio) => webFrame.setZoomFactor(ratio),
})

const { getWallpaper } = require('../../utils/Win11Wallpaper');
new Binder('wallpaper').bind('getWallpaper', getWallpaper);



const { login, loginViaQRCode, validQRLogin, getUserAccount } = require('../../utils/api/login')
const { Search, suggest } = require('../../utils/api/search')
const { checkIn } = require('../../utils/api/dailySignin')
const {
    getUserPlaylist, getPlaylistDetail, getArtistSublist, getAlbumSublist,
    getAlbumDetail,
} = require('../../utils/api/playlist')
const { getSongDetail, getSongUrl, getSongDownload, getSongUrlX } = require('../../utils/api/song')
const { logout } = require('NeteaseCloudMusicApi')
const { getArtistDetail, getArtistSongs } = require('../../utils/api/artist')


new Binder('NeteaseApi')
.bind('login', createFuncBinding(login))
.bind('search', createFuncBinding(Search))
.bind('suggest', createFuncBinding(suggest))
.bind('checkIn', createFuncBinding(checkIn))
.bind('getUserPlaylist', createFuncBinding(getUserPlaylist))
.bind('getPlaylistDetail', createFuncBinding(getPlaylistDetail))
.bind('getSongDetail', createFuncBinding(getSongDetail))
.bind('getSongUrl', createFuncBinding(getSongUrl))
.bind('getSongDownload', createFuncBinding(getSongDownload))
.bind('getSongUrlX', createFuncBinding(getSongUrlX))
.bind('loginViaQRCode', createFuncBinding(loginViaQRCode))
.bind('validQRLogin', createFuncBinding(validQRLogin))
.bind('getUserAccount', createFuncBinding(getUserAccount))
.bind('logout', createFuncBinding(logout))
.bind('getAlbumSublist', createFuncBinding(getAlbumSublist))
.bind('getArtistSublist', createFuncBinding(getArtistSublist))
.bind('getAlbumDetail', createFuncBinding(getAlbumDetail))
.bind('getArtistDetail', createFuncBinding(getArtistDetail))
.bind('getArtistSongs', createFuncBinding(getArtistSongs))


Binder.bindAll();
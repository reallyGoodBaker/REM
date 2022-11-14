const { ipcRenderer, screen } = require('electron');
const Binder = require('../../utils/jsBinder');
const { createFuncBinding } = require('../../utils/api/funcBinder');
const fs = require('fs')


const { fetchJson } = require('../../utils/server/fetch')
const [
    _, AppData, AppCache
] = fs.readFileSync('./Path').toString().split('\n')

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
    rm: (...args) => ipcRenderer.removeListener.apply(ipcRenderer, args),
})

const { getWallpaper } = require('../../utils/Win11Wallpaper');
new Binder('wallpaper').bind('getWallpaper', getWallpaper);



const { login, loginViaQRCode, validQRLogin, getUserAccount } = require('../../utils/api/login');
const { Search, suggest } = require('../../utils/api/search');
const { checkIn } = require('../../utils/api/dailySignin');
const {
    getUserPlaylist, getPlaylistDetail, getArtistSublist, getAlbumSublist,
    getAlbumDetail,
} = require('../../utils/api/playlist');
const { getSongDetail, getSongUrl, getSongDownload, getSongUrlX } = require('../../utils/api/song');
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
.bind('getSongDownload', createFuncBinding(getSongDownload))
.bind('getSongUrlX', createFuncBinding(getSongUrlX))
.bind('loginViaQRCode', createFuncBinding(loginViaQRCode))
.bind('validQRLogin', createFuncBinding(validQRLogin))
.bind('getUserAccount', createFuncBinding(getUserAccount))
.bind('logout', createFuncBinding(logout))
.bind('getAlbumSublist', createFuncBinding(getAlbumSublist))
.bind('getArtistSublist', createFuncBinding(getArtistSublist))
.bind('getAlbumDetail', createFuncBinding(getAlbumDetail))



Binder.bindAll();
fs.rmSync('./Path')
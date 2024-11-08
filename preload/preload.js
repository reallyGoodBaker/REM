require('../utils/main-invoker/preload')

const { ipcRenderer, webFrame } = require('electron')
const Binder = require('../utils/jsBinder')
const { createFuncBinding } = require('../utils/api/funcBinder')

ipcRenderer.setMaxListeners(0)

new Binder('hooks')
.use({
    invoke: (...args) => ipcRenderer.invoke.apply(ipcRenderer, args),
    send: (...args) => ipcRenderer.send.apply(ipcRenderer, args),
    sendSync: (...args) => ipcRenderer.sendSync.apply(ipcRenderer, args),
    on: (...args) => ipcRenderer.on.apply(ipcRenderer, args),
    once: (...args) => ipcRenderer.once.apply(ipcRenderer, args),
    off: (...args) => ipcRenderer.removeListener.apply(ipcRenderer, args),
    rm: (...args) => ipcRenderer.removeListener.apply(ipcRenderer, args),
    rmAll: type => ipcRenderer.removeAllListeners.call(ipcRenderer, type),
    zoom: ratio => webFrame.setZoomFactor(ratio),
})

const { login, loginViaQRCode, validQRLogin, getUserAccount, getCaptcha, verifyCaptcha } = require('../utils/api/login')
const { Search, suggest } = require('../utils/api/search')
const { checkIn } = require('../utils/api/dailySignin')
const {
    getUserPlaylist, getPlaylistDetail, getArtistSublist, getAlbumSublist,
    getAlbumDetail,
} = require('../utils/api/playlist')
const { getSongDetail, getSongUrl, getSongDownload, getSongUrlX } = require('../utils/api/song')
const { logout } = require('NeteaseCloudMusicApi')
const { getArtistDetail, getArtistSongs, getArtistAlbums } = require('../utils/api/artist')
const { getLyrics } = require('../utils/api/lyrics')
const { fetchJson } = require('../utils/server/fetch')

new Binder('server')
    .use({ ...require('../utils/server/media-cache'), fetchJson })

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
.bind('getArtistAlbums', createFuncBinding(getArtistAlbums))
.bind('getLyrics', createFuncBinding(getLyrics))
.bind('getCaptcha', createFuncBinding(getCaptcha))
.bind('verifyCaptcha', createFuncBinding(verifyCaptcha))


Binder.bindAll();
const { createFuncBinding } = require('../../utils/api/funcBinder.js')
const { login, loginViaQRCode, validQRLogin, getUserAccount, logout, getCaptcha, verifyCaptcha } = require('../../utils/api/login.js')
const { Search, suggest } = require('../../utils/api/search.js')
const { checkIn } = require('../../utils/api/dailySignin.js')
const {
    getUserPlaylist, getPlaylistDetail, getArtistSublist, getAlbumSublist,
    getAlbumDetail
} = require('../../utils/api/playlist.js')
const { getSongDetail, getSongUrl, getSongDownload, getSongUrlX } = require('../../utils/api/song.js')
const { getArtistDetail, getArtistSongs, getArtistAlbums } = require('../../utils/api/artist')
const { getLyrics } = require('../../utils/api/lyrics.js')


module.exports = () => {
//

createFuncBinding(login)
createFuncBinding(Search)
createFuncBinding(suggest)
createFuncBinding(checkIn)
createFuncBinding(getUserPlaylist)
createFuncBinding(getPlaylistDetail)
createFuncBinding(getSongDetail)
createFuncBinding(getSongUrl)
createFuncBinding(loginViaQRCode)
createFuncBinding(validQRLogin)
createFuncBinding(getUserAccount)
createFuncBinding(logout)
createFuncBinding(getArtistSublist)
createFuncBinding(getAlbumSublist)
createFuncBinding(getAlbumDetail)
createFuncBinding(getSongDownload)
createFuncBinding(getSongUrlX)
createFuncBinding(getArtistDetail)
createFuncBinding(getArtistSongs)
createFuncBinding(getArtistAlbums)
createFuncBinding(getLyrics)
createFuncBinding(getCaptcha)
createFuncBinding(verifyCaptcha)


}
const {createFuncBinding} = require('../utils/api/funcBinder');
const {login, loginViaQRCode, validQRLogin, getUserAccount, logout} = require('../utils/api/login');
const {Search, suggest} = require('../utils/api/search');
const {checkIn} = require('../utils/api/dailySignin');
const {
    getUserPlaylist, getPlaylistDetail, getArtistSublist, getAlbumSublist,
    getAlbumDetail
} = require('../utils/api/playlist');
const {getSongDetail, getSongUrl} = require('../utils/api/song');


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


}
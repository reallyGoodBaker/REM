const {user_playlist, playlist_create, playlist_delete, playlist_detail} = require('NeteaseCloudMusicApi');



async function getUserPlaylist(uid, cookie) {
    const playerPlaylist = await user_playlist({uid, cookie})
    return playerPlaylist;
}

async function getPlaylistDetail(id, cookie) {
    const detail = await playlist_detail({id, cookie});
    return detail;
}

function createPlaylist() {
    playlist_create()
}

function deletePlaylist() {

}

module.exports = {
    getUserPlaylist, getPlaylistDetail, 
}
const {
    user_playlist, playlist_create, playlist_delete, playlist_detail, album_sublist, artist_sublist,
    album
} = require('NeteaseCloudMusicApi');



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

async function getAlbumSublist(cookie) {
    const data = await album_sublist({cookie})
    return data
}

async function getArtistSublist(cookie) {
    const data = await artist_sublist({cookie})
    return data
}

async function getAlbumDetail(id, cookie) {
    const detail = await album({id, cookie});
    return detail;
}

module.exports = {
    getUserPlaylist, getPlaylistDetail, getAlbumSublist,
    getArtistSublist, getAlbumDetail
}
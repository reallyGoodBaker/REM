const {
    user_playlist, playlist_create, playlist_delete, playlist_detail, album_sublist, artist_sublist,
    album
} = require('NeteaseCloudMusicApi')



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

async function getAlbumSublist(cookie, count=12) {
    const data = await album_sublist({cookie, limit: count})
    return data
}

async function getArtistSublist(cookie, count=12) {
    const data = await artist_sublist({cookie, limit: count})
    return data
}

async function getAlbumDetail(id, cookie) {
    try {
        const detail = await album({id, cookie})
        return detail
    } catch (_) {
        return null
    }
}

module.exports = {
    getAlbumDetail, getAlbumSublist, getArtistSublist, getPlaylistDetail,
    getUserPlaylist,
}
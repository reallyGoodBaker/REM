const { artist_detail, artist_songs } = require('NeteaseCloudMusicApi')

async function getArtistDetail(id) {
    const result = await artist_detail({ id })

    if (result.body.code !== 200) {
        return null
    }
    return result.body.data
}

async function getArtistSongs(id, limit=50, offset=0, order='hot') {
    const res = await artist_songs({ id, order, limit, offset })

    if (res.body.code !== 200) {
        return null
    }

    return res.body
}

module.exports = {
    getArtistDetail, getArtistSongs
}
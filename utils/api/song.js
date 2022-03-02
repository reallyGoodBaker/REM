const {song_url, song_detail} = require('NeteaseCloudMusicApi'); 

async function getSongUrl(id, cookie, br=999000) {
    return await song_url({id, cookie, br});
}

async function getSongDetail(ids, cookie) {
    return await song_detail({ids: ids.join(','), cookie});
}

module.exports = {
    getSongUrl, getSongDetail
}
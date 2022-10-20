const {song_url, song_url_v1, song_detail, song_download_url} = require('NeteaseCloudMusicApi'); 

async function getSongUrl(id, cookie, br=999000) {
    return await song_url({id, cookie, br});
}

async function getSongUrlX(id, cookie, level='hires') {
    return await song_url_v1({id, cookie, level});
}

async function getSongDetail(ids, cookie) {
    return await song_detail({ids: ids.join(','), cookie});
}

async function getSongDownload(id, cookie, br=999000) {
    return await song_download_url({id, cookie, br});
}

module.exports = {
    getSongUrl, getSongDetail, getSongDownload, getSongUrlX
}
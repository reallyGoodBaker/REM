const { lyric } = require('NeteaseCloudMusicApi')

async function getLyrics(id, cookie) {
    return await lyric({id, cookie})
}

module.exports = {
    getLyrics
}
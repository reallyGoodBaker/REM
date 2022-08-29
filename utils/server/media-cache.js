const fs = require('fs')
const path = require('path')
const {saveTo} = require('./download')

module.exports = function(cache) {

const SaveType = {
    Null: '0',
    Cache: '1',
    Saved: '2'
}

async function saveToCache(url, uri) {
    await saveTo(url, path.resolve(cache, `${uri}.mp3`))
}

function getMedia(uri) {
    const cachePath = path.resolve(cache, `${uri}.mp3`)
    if (fs.existsSync(cachePath)) {
        return fs.readFileSync(cachePath)
    }
    return null
}

function saveToPlaylist(playlist, name) {
    fs.writeFile(path.join(cache, name), JSON.stringify(playlist), err => {
        if (err) {
            console.log(err)
        }
    })
}

function getPlaylist(name) {
    const playlistPath = path.join(cache, name)
    if (fs.existsSync(playlistPath)) {
        return fs.readFileSync(playlistPath)
    }
    return null
}

return {
    saveToCache, getMedia, saveToPlaylist, getPlaylist
}

}
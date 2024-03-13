const fs = require('fs')
const path = require('path')
const {saveTo} = require('./download')
const { parseBuffer } = require('music-metadata')
const fsp = require('fs/promises')
const { promiseResolvers } = require('../high-level/node/promise')

module.exports = function(cache) {

const SaveType = {
    Null: '0',
    Cache: '1',
    Saved: '2'
}

async function saveToCache(url, uri, callback) {
    return await saveTo(url, path.resolve(cache, `${uri}`), callback)
}

function getMedia(uri, callback) {
    const cachePath = path.resolve(cache, `${uri}`)
    if (fs.existsSync(cachePath)) {
        const buf = fs.readFileSync(cachePath)
        if (callback) {
            parseBuffer(buf)
            .then(buf => {
                callback.call(undefined, buf)
            })
            .catch(() => callback.call(undefined, null))
        }
        return buf
    }
    return null
}

async function getMetadata(buffer) {
    return await parseBuffer(buffer)
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

async function clearCache(...uriList) {
    let finished = 0
    const { promise, resolve } = promiseResolvers()
    const errList = []
    const finish = () => {
        if ((++finished) === uriList.length) {
            resolve(errList)
        }
    }

    uriList.forEach(async uri => {
        fsp.rm(path.resolve(cache, `${uri}`))
            .then(finish)
            .catch(() => {
                errList.push(uri)
                finish()
            })
    })

    return promise
}

async function clearAllCache() {
    return await clearCache(...fs.readdirSync(cache))
}

return {
    saveToCache, getMedia, saveToPlaylist, getPlaylist, getMetadata,
    clearCache, clearAllCache,
}

}
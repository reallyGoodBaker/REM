const fs = require('fs')
const path = require('path')
const { saveTo } = require('./download')
const { parseBuffer } = require('music-metadata')
const fsp = require('fs/promises')
const { promiseResolvers } = require('../high-level/node/promise')
const { readPath } = require('../appPath/preload')

let AppCache
async function cache() {
    return AppCache ?? (AppCache = (await readPath()).AppCache)
}

const SaveType = {
    Null: '0',
    Cache: '1',
    Saved: '2'
}

async function saveToCache(url, uri, callback) {
    await saveTo(url, path.resolve(await cache(), `${uri}`), callback)
}

async function getMedia(uri, callback) {
    const cachePath = path.resolve(await cache(), `${uri}`)
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

async function saveToPlaylist(playlist, name) {
    fs.writeFile(path.join(await cache(), name), JSON.stringify(playlist), err => {
        if (err) {
            console.log(err)
        }
    })
}

async function getPlaylist(name) {
    const playlistPath = path.join(await cache(), name)
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
        fsp.rm(path.resolve(await cache(), `${uri}`))
            .then(finish)
            .catch(() => {
                errList.push(uri)
                finish()
            })
    })

    return promise
}

async function clearAllCache() {
    return await clearCache(...fs.readdirSync(await cache()))
}

module.exports = {
    saveToCache, getMedia, saveToPlaylist, getPlaylist, getMetadata,
    clearCache, clearAllCache,
}
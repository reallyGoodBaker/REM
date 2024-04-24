const http = require('http')
const { parseStream } = require('music-metadata')
const fs = require('fs')

function download(url, onDataTransfer = (chunk, size)=>{}) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            const size = res.headers['content-length']
            onDataTransfer.call(null, undefined, size)
            res.on('data', chunk => onDataTransfer.call(null, chunk, size))
            res.on('end', () => resolve())
            res.on('error', er => reject(er))
        })
    })
}

function saveTo(from, to, onMetadataLoaded) {
    return new Promise((resolve, reject) => {
        http.get(from, res => {
            let stream = fs.createWriteStream(to)
            let allChunks = Buffer.alloc(0)

            if (typeof onMetadataLoaded === 'function') {
                parseStream(res)
                .then(v => onMetadataLoaded.call(undefined, v))
                .catch(() => resolve(null))
            }

            res.on('data', chunk => {
                stream.write(chunk)
                allChunks = Buffer.concat([allChunks, chunk])
            })
            res.on('end', () => resolve(allChunks))
            res.on('error', er => {
                res.destroy()
                fs.rmSync(to, { force: true })
                reject(er)
            })
        })
    })
}

module.exports = {
    download, saveTo
}
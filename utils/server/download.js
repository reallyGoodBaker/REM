const http = require('http')
const fs = require('fs')

function download(url, onDataTransfer = (chunk, size)=>{}) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            onDataTransfer.call(null, undefined, res.headers['content-length'])
            res.on('data', chunk => onDataTransfer.call(null, chunk))
            res.on('end', () => resolve())
            res.on('error', er => reject(er))
        })
    })
}

function saveTo(from, to, onProgressChange = (receved, total) => {}) {
    return new Promise((resolve, reject) => {
        http.get(from, res => {
            const total = res.headers['content-length']
            let receved = 0
    
            res.pipe(fs.createWriteStream(to))
            res.on('data', chunk => {
                receved += chunk.length
                onProgressChange.call(null, receved, total)
            })
            res.on('end', () => {
                resolve()
            })
        })
    })
}

module.exports = {
    download, saveTo
}
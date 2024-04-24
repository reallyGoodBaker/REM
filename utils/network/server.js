const { ipcMain } = require('electron')
const http = require('https')
const { promiseResolvers } = require('../high-level/node/promise')

async function checkIsOnline(timeout=3000) {
    const { promise, resolve } = promiseResolvers()
    setTimeout(() => resolve(false), timeout);
    http.request('https://captive.apple.com/hotspot-detect.html')
        .on('response', () => resolve(true))
        .on('error', () => resolve(false))
    return promise
}

async function watchNetworkChange() {
    let online = await checkIsOnline()

    setInterval(async () => {
        let newState = await checkIsOnline()

        if (newState !== online) {
            ipcMain.emit('onlineChange', online = newState)
            ipcMain.emit(`${online? 'on': 'off'}line`)
        }
    }, 5000)

    ipcMain.on('onlineState', (_, callback) => {
        return callback.call(null, online)
    })
}

module.exports = {
    watchNetworkChange
}
const {ipcMain} = require('electron')
const child_process = require('child_process')

async function checkIsOnline(timeout=3000) {
    return new Promise(res => {
        const p = child_process.exec('ping pool.ntp.org', er => {
            res(!er)
            p.kill(0)
        })

        setTimeout(() => {
            res(false)
            p.kill(0)
        }, timeout);
    })
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
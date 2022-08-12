const {ipcMain} = require('electron')
const child_process = require('child_process')

async function checkIsOnline() {
    return new Promise(res => {
        child_process.exec('ping www.bing.com', er => {
            if (er) {
                return res(false)
            }

            res(true)
        })
    })
}

async function watchNetworkChange() {
    let online = await checkIsOnline()

    setInterval(async () => {
        let newState = await checkIsOnline()

        if (newState !== online) {
            ipcMain.emit('onlineChange', online = newState)
            if (online) {
                ipcMain.emit('online')
            } else {
                ipcMain.emit('offline')
            }
        }
    }, 5000)
}

module.exports = {
    watchNetworkChange
}
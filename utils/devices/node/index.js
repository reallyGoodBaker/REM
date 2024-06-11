const { ipcMain } = require('electron')
const { publish } = require('../../ipc/main')

function initDevicesMain() {
    ipcMain.on('output:setOutputDevice', (_, deviceId) => {
        publish('device:set', deviceId)
    })
}

module.exports = {
    initDevicesMain,
}
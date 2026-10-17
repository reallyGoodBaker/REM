const { ipcMain } = require('electron')
const { publish } = require('../../ipc/main')

let outputDevice = null
let resolveOutputDevice
const outputDeviceReady = new Promise(resolve => resolveOutputDevice = resolve)

function initDevicesMain() {
    ipcMain.on('output:setOutputDevice', (_, device) => {
        if (!device || typeof device.label !== 'string' || typeof device.deviceId !== 'string' || !device.deviceId) {
            return
        }
        outputDevice = {
            label: device.label.replace(/^.* - /, ''),
            deviceId: device.deviceId,
        }
        resolveOutputDevice(outputDevice)
        publish('device:set', device)
    })
}

function getOutputDevice() {
    // Device enumeration may finish after the renderer's normal IPC timeout.
    return outputDevice || outputDeviceReady
}

module.exports = {
    initDevicesMain, getOutputDevice,
}

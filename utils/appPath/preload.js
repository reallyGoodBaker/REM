const { ipcRenderer } = require('electron')

async function readPath() {
    return await ipcRenderer.invoke('paths?')
}

module.exports = {
    readPath
}
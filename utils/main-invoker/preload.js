const Binder = require('../jsBinder')
const { ipcRenderer } = require('electron')

new Binder('[[@@invoker]]')
.use({
    on: (channel, listener) => ipcRenderer.on(`[[@@${channel}]]`, listener),
    off: (channel, listener) => ipcRenderer.off(`[[@@${channel}]]`, listener),
    clear: channel => ipcRenderer.removeAllListeners(`[[@@${channel}]]`),
    send: (channel, ...values) => ipcRenderer.send(`[[@@${channel}]]`, ...values),
    invoke: (channel, ...values) => ipcRenderer.invoke(`[[@@${channel}]]`, ...values),
})
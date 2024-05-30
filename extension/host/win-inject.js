Object.assign(globalThis, require('../../utils/ipc/net'))

const win = {
    beforeClose: Function.prototype,
    shared: Function.prototype,
    init: Function.prototype,
}

const electron = require('electron')

Object.assign(globalThis, electron, {
    win,
})

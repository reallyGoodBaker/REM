const { BrowserWindow } = require('electron')

/**
 * @param {BrowserWindow} bw 
 */
module.exports = function (bw) {
    const web = bw.webContents

    return new Proxy({
        keys() {
            return ['play', 'pause', 'next', 'previous'].map(v => 'player:' + v)
        }
    }, {
        get(t, p) {
            if (p === 'keys') {
                return t[p]
            }
            if (p.startsWith('player:')) {
                return () => web.send(p)
            }
        },
        set() { return false }
    })
}
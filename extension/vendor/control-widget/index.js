const {
    whenReady, win, provide
} = require('../../runtime/index')
const path = require('path')

let winId

const setup = async () => {
    winId = await win.openWindow(path.join(__dirname, './ui/index.html'), {
        width: 380,
        height: 140,
        alwaysOnTop: true,
        // visualEffectState: 'active',
        frame: false,
        // backgroundMaterial: 'none',
        transparent: true,
        maximizable: false,
        resizable: false,
        extra: {
            replaceMain: true,
            // openDevTools: true,
            main: path.join(__dirname, './main.js'),
        }
    })
}

whenReady(setup)

provide('beforeDisable', () => {
    win.closeWindow(winId)
})
const { ipcMain, BrowserWindow, screen } = require('electron')

const { width, height } = screen.getPrimaryDisplay().bounds

browserWindow.setBounds({
    x: width - 400,
    y: height - 220
})

ipcMain.on('win:restore', () => {
    BrowserWindow.getAllWindows().forEach(w => {
        if (w.id === browserWindow.id) {
            w.hide()
        } else {
            w.show()
        }
    })
})
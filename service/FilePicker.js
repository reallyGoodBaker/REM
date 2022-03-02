const {ipcMain, dialog} = require('electron');

class FilePicker{
    constructor(id, win) {
        this.id = id;
        this.win = win;
    }

    onSelected(handler) {
        ipcMain.on(this.id+':select', async (ev, opt) => {
            let res = await dialog.showOpenDialog(this.win, opt);

            if (res.canceled) {
                return this.oncanceld();
            }

            handler(res.filePaths);
        })
    }

    onCanceled(handler) {
        this.oncanceld = handler;
    }

    oncanceld() {}
}

module.exports = FilePicker;
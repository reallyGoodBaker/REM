const { ipcMain, ipcRenderer, app } = require('electron')

class FuncBinder {
    static id = 0;

    constructor(func) {
        this.funcName = func.name || FuncBinder.id++;
        this.func = func;
    }


    buildRenderer() {
        const func = (...args) => {
            return new Promise((resolve) => {
                ipcRenderer.send(this.funcName, ...args);
                ipcRenderer.once('recev-' + this.funcName, (ev, arg) => {
                    resolve(arg);
                });
            })
        }

        return func;
    }


    buildHost() {
        ipcMain.on(this.funcName, async (ev, ...args) => {
            let res = this.func(...args);
            if(res instanceof Promise) {
                const val = await res
                // if (!app.isPackaged) {
                //     console.log('%s called with args %s, return %o', this.funcName, args, val);
                // }
                return ev.sender.send('recev-' + this.funcName, val);
            }
            ev.sender.send('recev-' + this.funcName, res);
        });
    }


    buildFunc() {
        if(ipcMain) this.buildHost();
        if(ipcRenderer) return this.buildRenderer();
    }
}

function createFuncBinding(func) {
    return new FuncBinder(func).buildFunc();
}

module.exports = {
    FuncBinder, createFuncBinding
}
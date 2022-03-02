const {ipcMain, ipcRenderer} = require('electron');

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
                return ev.sender.send('recev-' + this.funcName, await res);
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
    FuncBinder,
    createFuncBinding
}
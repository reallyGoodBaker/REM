// import { ipcRenderer } from "electron"

export const fp = {
    open(title, defaultPath, properties) {
        Electron.ipcRenderer.send('fp:select', {title, defaultPath, properties});
    }
}
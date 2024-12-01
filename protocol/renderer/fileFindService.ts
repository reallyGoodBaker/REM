import { IpcRenderer } from 'electron'

//@ts-ignore
const ipcRenderer: IpcRenderer = hooks

class FileFindServiceRenderer {
    find(folders: string[]) {
        return ipcRenderer.invoke('fileFindService.find', folders)
    }

    sync() {
        ipcRenderer.invoke('fileFindService.sync')
    }

    addDir(dir: string) {
        ipcRenderer.invoke('fileFindService.addDir', dir)
    }

    removeDir(dir: string) {
        ipcRenderer.invoke('fileFindService.removeDir', dir)
    }

    getDirs() {
        return ipcRenderer.invoke('fileFindService.getDirs')
    }
}

export const fileFindService = new FileFindServiceRenderer()
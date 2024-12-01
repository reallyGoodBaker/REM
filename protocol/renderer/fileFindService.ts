import { IpcRenderer } from 'electron'

//@ts-ignore
const ipcRenderer: IpcRenderer = hooks

class FileFindServiceRenderer {
    find(folders: string[]) {
        return ipcRenderer.invoke('fileFindService.find', folders)
    }

    sync() {
        return ipcRenderer.invoke('fileFindService.sync') as Promise<void>
    }

    addDir(dir: string) {
        return ipcRenderer.invoke('fileFindService.addDir', dir) as Promise<void>
    }

    removeDir(dir: string) {
        return ipcRenderer.invoke('fileFindService.removeDir', dir) as Promise<void>
    }

    getDirs() {
        return ipcRenderer.invoke('fileFindService.getDirs')
    }
}

export const fileFindService = new FileFindServiceRenderer()
import { Worker } from 'worker_threads'
import { db } from '../../node/db'
import { IAudioFindResult } from './fileFinder'
import { ProtocolConfKeys } from '../../common/keys'
import { ipcMain } from 'electron'
import * as path from 'path'

export interface IFileFindResult {
    [root: string]: IAudioFindResult[]
}

class FileFindService {
    readonly metadatas = db('metadata')
    readonly conf = db('conf')

    constructor() {
        this.sync()
    }

    async find(folders: string[]): Promise<IFileFindResult> {
        const result: IFileFindResult = {}
        await Promise.all(
            folders.map(
                async folder => (result[folder] = await this.findFiles(folder))
            )
        )

        return result
    }

    async findFiles(folderPath: string): Promise<IAudioFindResult[]> {
        const worker = new Worker(path.join(__dirname, 'fileFinder.js'))
        worker.postMessage(folderPath)
        const result = await new Promise<IAudioFindResult[]>(resolve => {
            worker.on('message', v => {
                resolve(v)
                worker.terminate()
            })
        })

        return result
    }

    async sync() {
        const rootDirs = await this.conf.findAsync({ key: ProtocolConfKeys.LOCALFILE_ROOTDIR })
        const rootDirsArr = rootDirs.map(r => r.value)

        for (const [ _, value ] of Object.entries(await this.find(rootDirsArr))) {
            for (const res of value) {
                const hasAny = await this.metadatas.findOneAsync<IAudioFindResult>({ filePath: res.filePath })
                if (!hasAny) {
                    await this.metadatas.insertAsync(res)
                }
            }
        }
    }

    async addDir(dir: string) {
        const rootDirs = await this.conf.findAsync({ key: ProtocolConfKeys.LOCALFILE_ROOTDIR })
        const rootDirsArr = rootDirs.map(r => r.value)
        if (!rootDirsArr.includes(dir)) {
            await this.conf.insertAsync({ key: ProtocolConfKeys.LOCALFILE_ROOTDIR, value: dir })
        }
    }

    async removeDir(dir: string) {
        const rootDirs = await this.conf.findAsync({ key: ProtocolConfKeys.LOCALFILE_ROOTDIR })
        const rootDirsArr = rootDirs.map(r => r.value)
        if (rootDirsArr.includes(dir)) {
            await this.conf.removeAsync({ key: ProtocolConfKeys.LOCALFILE_ROOTDIR, value: dir }, {})
        }
    }

    async getDirs() {
        const rootDirs = await this.conf.findAsync({ key: ProtocolConfKeys.LOCALFILE_ROOTDIR })
        return rootDirs.map(r => r.value)
    }
}

export const fileFindService = new FileFindService()

export async function registerFileFindService() {
    ipcMain.handle('fileFindService.find', async (_, folders: string[]) => {
        return await fileFindService.find(folders)
    })

    ipcMain.handle('fileFindService.sync', async () => {
        await fileFindService.sync()
    })

    ipcMain.handle('fileFindService.addDir', async (_, dir: string) => {
        await fileFindService.addDir(dir)
    })

    ipcMain.handle('fileFindService.removeDir', async (_, dir: string) => {
        await fileFindService.removeDir(dir)
    })

    ipcMain.handle('fileFindService.getDirs', async () => {
        return await fileFindService.getDirs()
    })

}
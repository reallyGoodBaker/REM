import * as fs from 'fs'
import * as path from 'path'
import { audioContainers } from '../../common/audioContainers'
import { IAudioMetadata, parseFile } from 'music-metadata'
import { promiseResolvers } from '../../common/provider'
import { parentPort, isMainThread } from 'worker_threads'

export interface IAudioFindResult extends IAudioMetadata {
    filePath: string
    dir: string
}

function maybeAudioFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()

    return audioContainers.has(ext)
}

function findPotentialAudioFiles(dirPath: string): string[] {
    const potentials: string[] = []
    const files = fs.readdirSync(dirPath)

    files.forEach(file => {
        const filePath = path.join(dirPath, file)
        if (fs.statSync(filePath).isFile() && maybeAudioFile(filePath)) {
            potentials.push(filePath)
        }

        if (fs.statSync(filePath).isDirectory()) {
            const subFiles = findPotentialAudioFiles(filePath)
            potentials.push(...subFiles)
        }
    })

    return potentials
}

function parseAudioMetadata(filePath: string, dirPath: string) {
    const { promise, resolve } = promiseResolvers<IAudioFindResult|null>()
    parseFile(filePath, { duration: true })
        .then((metadata: any) => {
            metadata.filePath = filePath
            metadata.dir = dirPath
            resolve(metadata)
        })
        .catch(err => {
            console.error(err)
            resolve(null)
        })
    
    return promise
}

async function findAudioFiles(dirPath: string): Promise<IAudioFindResult[]> {
    const potentials = findPotentialAudioFiles(dirPath)
        .map<Promise<IAudioFindResult|null>>(fp => parseAudioMetadata(fp, dirPath))

    return (await Promise.all(potentials))
        .filter(metadata => metadata !== null)
}

if (!isMainThread) {
    parentPort!.on('message', async value => {
        parentPort!.postMessage(await findAudioFiles(value))
    })
}
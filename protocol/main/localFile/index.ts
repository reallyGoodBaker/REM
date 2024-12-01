import { registerFileFindService } from './fileFindService'
import { registerSongProvider } from './songs'

export function initLocalFileProviders() {
    registerSongProvider()
    registerFileFindService()
}
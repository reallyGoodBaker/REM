import { AudioPlayer } from '../player/player'
import { MainPlaylist } from '../player/playlist'
import { rem } from '../rem'
import { registerShortcut } from './core'

export function initAppShortcut() {
    registerShortcut('Ctrl+Tab', () => {
        Pager.next()
    })
    
    registerShortcut('Ctrl+Shift+Tab', () => {
        Pager.prev()
    })

    registerShortcut('Ctrl+w', () => {
        Pager.removeCurrent()
    })

    registerShortcut('Ctrl+f', () => {
        rem.emitNone('toggleSearch')
    })

    registerShortcut(' ', () => {
        rem.emitNone('togglePlay')
    })

    registerShortcut('Ctrl+ArrowLeft', () => {
        MainPlaylist.playPrev()
    })

    registerShortcut('Ctrl+ArrowRight', () => {
        MainPlaylist.playNext()
    })

    registerShortcut('ArrowLeft', () => {
        AudioPlayer.seek(Math.max(AudioPlayer.seek() - 1, 0))
    })

    registerShortcut('ArrowRight', () => {
        AudioPlayer.seek(Math.min(AudioPlayer.seek() + 1, AudioPlayer.duration()))
    })
}
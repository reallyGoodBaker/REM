import { registerShortcut } from './core'
import { AudioPlayer } from '../../player/player'
import { MainPlaylist } from '../../player/playlist'
import { rem } from '../../rem'

export function registerDefaultShortcuts() {
    registerShortcut('$next_tab', 'Ctrl+Tab', () => {
        Pager.next()
    })
    
    registerShortcut('$prev_tab', 'Ctrl+Shift+Tab', () => {
        Pager.prev()
    })
    
    registerShortcut('$close_tab', 'Ctrl+w', () => {
        Pager.removeCurrent()
    })
    
    registerShortcut('$toggle_search', 'Ctrl+f', () => {
        rem.emitNone('toggleSearch')
    })
    
    registerShortcut('$toggle_playing', ' ', () => {
        rem.emitNone('togglePlay')
    })
    
    registerShortcut('$prev_track', 'Ctrl+ArrowLeft', () => {
        MainPlaylist.playPrev()
    })
    
    registerShortcut('$next_track', 'Ctrl+ArrowRight', () => {
        MainPlaylist.playNext()
    })
    
    registerShortcut('$fast_backward', 'Alt+ArrowLeft', () => {
        AudioPlayer.seek(Math.max(AudioPlayer.seek() - 5, 0))
    })
    
    registerShortcut('$fast_forward', 'Alt+ArrowRight', () => {
        AudioPlayer.seek(Math.min(AudioPlayer.seek() + 5, AudioPlayer.duration()))
    })

    registerShortcut('$volume_up', 'Ctrl+=', () => {
        AudioPlayer.volume(Math.min(AudioPlayer.volume() + 0.1, 1))
        AudioPlayer.em.emit('volumechange')
    })

    registerShortcut('$volume_down', 'Ctrl+-', () => {
        AudioPlayer.volume(Math.max(AudioPlayer.volume() - 0.1, 0))
        AudioPlayer.em.emit('volumechange')
    })

    registerShortcut('$mute', 'Ctrl+m', () => {
        const player = AudioPlayer.getInstance()
        player.mute(!player.isMuted())
    })
}
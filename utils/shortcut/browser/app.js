import { __init_setting } from '../../../pages/settings/initSettings'
import { AudioPlayer } from '../../player/player'
import { MainPlaylist } from '../../player/playlist'
import { LifeCycle, rem } from '../../rem'
import { store } from '../../stores/base'
import { getShortcut, keyset2str, parseKeyset, registerShortcut } from './core'

export async function initAppShortcut() {
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
        AudioPlayer.seek(Math.max(AudioPlayer.seek() - 10, 0))
    })

    registerShortcut('$fast_forward', 'Alt+ArrowRight', () => {
        AudioPlayer.seek(Math.min(AudioPlayer.seek() + 10, AudioPlayer.duration()))
    })

    await LifeCycle.when('controlsReady')

    __init_setting('AppSettings/shortcuts', {
        $next_tab: 'Ctrl+Tab',
        $prev_tab: 'Ctrl+Shift+Tab',
        $close_tab: 'Ctrl+w',
        $toggle_search: 'Ctrl+f',
        $toggle_playing: ' ',
        $prev_track: 'Ctrl+ArrowLeft',
        $next_track: 'Ctrl+ArrowRight',
        $fast_backward: 'Alt+ArrowLeft',
        $fast_forward: 'Alt+ArrowRight',
    }, initVal => {
        for (const [ id, value ] of Object.entries(initVal)) {
            const shortcut = getShortcut(id)
            const [ key, flag ] = parseKeyset(value)

            shortcut.key = key
            shortcut.flag = flag
        }
    })
}

export async function saveKeybinding({ id, key, flag }) {
    const save = await store.get('AppSettings/shortcuts')
    save[id] = keyset2str(key, flag, true)

    await store.set('AppSettings/shortcuts', save)
}
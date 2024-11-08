import { __init_setting } from '../../../pages/settings/initSettings'
import { LifeCycle } from '../../rem'
import { store } from '../../stores/base'
import { getShortcut, keyset2str, parseKeyset } from './core'
import { registerDefaultShortcuts } from './keys'

export async function initAppShortcut() {
    registerDefaultShortcuts()

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
        $volume_up: 'Ctrl+=',
        $volume_down: 'Ctrl+-',
        $mute: 'Ctrl+m',
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
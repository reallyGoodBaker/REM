import { AudioPlayer } from "../../utils/player/player.js"
import { MainPlaylist } from "../../utils/player/playlist.js"
import { LifeCycle, rem } from "../../utils/rem.js"
import { safeStore, store } from "../../utils/stores/base.js"
import { home } from "./services/home-provider"
import { homeOptions } from "../../utils/home/browser.js"
import { loadExtensionSettings } from "./setting/settings-loader.js"
import { getPath } from '../../utils/appPath/renderer.js'
import { setCurrentModule } from './extension-context.js'

/** @type {Map<string, { uiExt: any, loadArgs: any }>} */
const loadedUIExts = new Map()

export function loadExtensionUI() {
    let config = null

    hooks.on('extension-ui:config', (_, m) => config = m)

    hooks.on('extension:loaded', async (_, m) => {
        await loadExtensionSettings(m)
        if (config?.[m.id]) {
            await activateExtensionUI(m)
        }
    })

    hooks.on('extension:activated', async (_, m) => {
        await activateExtensionUI(m)
    })

    hooks.on('extension:deactivated', async (_, m) => {
        await deactivateExtensionUI(m)
    })

    hooks.send('extension-ui:config?')
}

function unregisterByExtension(folderName) {
    let changed = false

    for (let i = homeOptions.length - 1; i >= 0; i--) {
        if (homeOptions[i].extFolder === folderName) {
            homeOptions.splice(i, 1)
            changed = true
        }
    }

    if (changed) {
        rem.emit('refreshHomeOptions')
    }
}

async function call(func, thisArg, ...args) {
    if (typeof func === 'function') {
        return await func.apply(thisArg, args)
    }
}

function mixin(target, m, component, key, obj) {
    if (!m.components.includes(component)) {
        return
    }

    target[key] = obj
}

function mixinAllComponents(t, m) {
    mixin(t, m, 'audio_player', 'AudioPlayer', AudioPlayer)
    mixin(t, m, 'playlist', 'Playlist', MainPlaylist)
    mixin(t, m, 'store', 'store', store)
}

async function activateExtensionUI(m) {
    if (!m?.uiEntry || loadedUIExts.has(m.id)) {
        return
    }

    await loadModules(m)
}

async function deactivateExtensionUI(m) {
    if (!m?.id || !loadedUIExts.has(m.id)) {
        return
    }

    const entry = loadedUIExts.get(m.id)
    await call(entry.uiExt?.onUnload, null, entry.loadArgs)
    unregisterByExtension(m.folderName)
    loadedUIExts.delete(m.id)
}

async function loadModules(m) {
    const path = m.uiEntry

    if (!path) {
        return
    }

    const uiExt = await import(
        `file://${await getPath('Extensions')}/${m.folderName}/${path}`)
    const settings = safeStore(`ExtensionSettings/${m.id}`)

    __currentModule = m

    const loadArgs = {
        home, settings
    }

    mixinAllComponents(loadArgs, m)
    await call(uiExt.onLoad, null, loadArgs)

    __currentModule = null

    loadedUIExts.set(m.id, { uiExt, loadArgs })

    LifeCycle
        .when('controlsReady')
        .then(() => {
            if (!loadedUIExts.has(m.id)) {
                return
            }

            call(uiExt.onReady, null, mixinAllComponents({ settings }, m))
        })
}

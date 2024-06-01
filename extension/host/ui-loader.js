import { AudioPlayer } from "../../utils/player/player.js"
import { MainPlaylist } from "../../utils/player/playlist.js"
import { LifeCycle } from "../../utils/rem.js"
import { safeStore, store } from "../../utils/stores/base.js"
import { home } from "./services/home-provider"
import { loadExtensionSettings } from "./setting/settings-loader.js"

const loadedUIExts = new Set()

export function loadExtensionUI() {
    let loaded = null

    hooks.on('extension-ui:config', (_, m) => loaded = m)
    hooks.on('extension:loaded', async (_, m) => {
        if (!loadedUIExts.has(m.id)) {
            await loadExtensionSettings(m)

            if (!loaded[m.id]) {
                return
            }

            loadModules(m)
        }
    })

    hooks.send('extension-ui:config?')
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

async function loadModules(m) {
    const path = m.uiEntry

    if (!path) {
        return
    }

    const uiExt = await import(
        `file://${AppPaths.Extensions}/${m.folderName}/${path}`)
    const settings = safeStore(`ExtensionSettings/${m.id}`)

    __currentModule = m

    let loadArgs = {
        home, settings
    }
    
    mixinAllComponents(loadArgs, m)
    await call(uiExt.onLoad, null, loadArgs)

    __currentModule = null

    loadedUIExts.add(m.id)

    LifeCycle
        .when('controlsReady')
        .then(() => {
            call(uiExt.onReady, null, mixinAllComponents({ settings }, m))
        })
}

export let __currentModule = null
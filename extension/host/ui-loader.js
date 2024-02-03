import { AudioPlayer } from "../../utils/player/player.js"
import { MainPlaylist } from "../../utils/player/playlist.js"
import { LifeCycle } from "../../utils/rem.js"
import { safeStore, store } from "../../utils/stores/base.js"
import { home } from "./services/home-provider"
import { registerCustomSetting } from "./setting-element.js"

const loadedUIExts = new Set()

export function loadExtensionUI() {
    let loaded = null

    hooks.on('extension-ui:config', (_, m) => loaded = m)
    hooks.on('extension:loaded', (_, m) => {
        if (!loaded[m.id]) {
            return
        }

        if (!loadedUIExts.has(m.id)) {
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
        `file://${path.endsWith('.v.js')
            ? AppPaths.ExtVendor
            : AppPaths.Extensions}/${m.folderName}/${path}`) 

    __currentModule = m

    let loadArgs = {
        home,
        safeStore: safeStore(`ExtensionSafeStore/${m.id}`)
    }
    
    mixinAllComponents(loadArgs, m)
    await call(uiExt.onLoad, null, loadArgs)
    registerCustomSetting(m.id, await call(uiExt.onSetting, null, loadArgs))   

    __currentModule = null

    loadedUIExts.add(m.id)

    LifeCycle
        .when('controlsReady')
        .then(() => {
            call(uiExt.onReady, null)
        })
}

export let __currentModule = null
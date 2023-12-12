import { LifeCycle } from "../../utils/rem.js"
import { home } from "./services/home-provider"

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

function call(func, thisArg, ...args) {
    if (typeof func === 'function') {
        func.apply(thisArg, args)
    }
}

async function loadModules(m) {
    const path = m.uiEntry

    if (!path) {
        return
    }

    const uiExt = await import(
        `file://${path.endsWith('.vendor.js')
            ? AppPaths.ExtVendor
            : AppPaths.Extensions}/${m.folderName}/${path}`) 

    __currentModule = m
    call(uiExt.onLoad, null, {
        home,
        
    })
    __currentModule = null

    loadedUIExts.add(m.id)

    LifeCycle
        .when('controlsReady')
        .then(() => {
            call(uiExt.onReady, null)
        })
}

export let __currentModule = null
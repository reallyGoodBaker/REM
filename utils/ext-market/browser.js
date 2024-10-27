import { rem } from "../rem"

export async function getRoot() {
    return await hooks.invoke('ext-market?root')
}

export async function setRoot(root) {
    return await hooks.invoke('ext-market:set-root', root)
}

export async function getList() {
    return await hooks.invoke('ext-market?list')
}

export async function getManifest(name) {
    return await hooks.invoke('ext-market?manifest', name)
}

export async function install(name) {
    let manifest
    if (manifest = await hooks.invoke('ext-market:install', name)) {
        rem.emit('extension:install', manifest)
        return true
    }

    return false
}

export async function uninstall(id) {
    const done = await hooks.invoke('ext-market:uninstall', id)
    if (done) {
        rem.emit('extension:uninstall', id)
    }

    return done
}

export async function query(ext) {
    return await hooks.invoke('extension?status', ext)
}
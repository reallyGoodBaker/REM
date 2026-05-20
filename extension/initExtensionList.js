import { rem } from "../utils/rem"

export const extensionManifests = new Map()

export function initExtensionList() {
    hooks.on('extension:loaded', (_, manifest) => {
        extensionManifests.set(manifest.id, manifest)
    })
    rem.on('extension:install', manifest => {
        extensionManifests.set(manifest.id, manifest)
    })
    rem.on('extension:uninstall', id => {
        extensionManifests.delete(id)
        rem.emit('reload-extension-list')
    })

    const onActivationChange = (_, m) => {
        const manifest = extensionManifests.get(m.id)

        if (!manifest) {
            return
        }

        Object.assign(manifest, m, {
            activated: m.activated ?? true,
        })
        extensionManifests.set(manifest.id, manifest)
        rem.emit('extension:status-changed', manifest)
    }

    hooks.on('extension:activated', onActivationChange)
    hooks.on('extension:deactivated', (_, m) => {
        const manifest = extensionManifests.get(m.id)

        if (!manifest) {
            return
        }

        Object.assign(manifest, m, { activated: false })
        extensionManifests.set(manifest.id, manifest)
        rem.emit('extension:status-changed', manifest)
    })
}

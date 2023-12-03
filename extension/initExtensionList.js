import { rem } from "../utils/rem"

export const extensionManifests = new Map()

export function initExtensionList() {
    hooks.on('extension:loaded', (_, manifest) => {
        extensionManifests.set(manifest.id, manifest)
    })

    const onActivationChange = (_, m) => {
        extensionManifests.forEach(manifest => {
            if (manifest.id !== m.id) {
                return
            }

            extensionManifests.set(manifest.id, manifest)

            if (m.uiEntry) {
                rem.emit('extension:need-relaunch', m)
            }
        })
    }

    hooks.on('extension:activated', onActivationChange)
    hooks.on('extension:deactivated', onActivationChange)
}
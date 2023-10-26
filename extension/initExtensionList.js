import { rem } from "../utils/rem"

const extensionManifests = []

export function initExtensionList() {
    hooks.on('extension:loaded', (_, manifest) => {
        extensionManifests.push(manifest)
    })

    const onActivationChange = (_, m) => {
        extensionManifests.forEach((manifest, i) => {
            if (manifest.id !== m.id) {
                return
            }

            extensionManifests[i] = m

            if (m.uiEntry) {
                rem.emit('extension:need-relaunch', m)
            }
        })
    }

    hooks.on('extension:activated', onActivationChange)
    hooks.on('extension:deactivated', onActivationChange)
}

export function getManifests() {
    return extensionManifests
}
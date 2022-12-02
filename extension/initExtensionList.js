const extensionManifests = []

export function initExtensionList() {
    hooks.on('extension:loaded', (_, manifest) => {
        extensionManifests.push(manifest)
    })
}

export function getManifests() {
    return extensionManifests.slice()
}
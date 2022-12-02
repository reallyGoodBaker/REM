const fs = require('fs')
const path = require('path')

function throwError(msg, name) {
    if (name) {
        throw new Error(`\nUnable to load plugin "${name}"\n  -> ${msg}\n`)
    }

    throw new Error(`\nUnable to load plugin\n  -> ${msg}\n`)
}

module.exports = function parse(filePath) {
    const content = fs.readFileSync(filePath).toString()
    const root = path.resolve(filePath, '../')

    let manifest
    try {
        manifest = JSON.parse(content)
    } catch (_) {
        throwError('Illegal Manifest JSON.')
    }

    ['name', 'ver', 'entry', 'components', 'id'].forEach(field => {
        if (!(field in manifest)) {
            if (field !== 'name') {
                throwError(`Field "${field}" is required.`, manifest.name)
            }

            throwError(`Field "${field}" is required.`)
        }
    })

    const entryPath = path.join(root, manifest.entry)
    if (!fs.existsSync(entryPath)) {
        throwError('Entry file not found.', manifest.name)
    }

    const components = manifest.components
    if (!Array.isArray(components)) {
        manifest.components = []
    }

    return manifest
}


const fs = require('fs')
const path = require('path')

module.exports = function parse(filePath) {
    const content = fs.readFileSync(filePath).toString()
    const root = path.resolve(filePath, '../')

    let manifest
    try {
        manifest = JSON.parse(content)
    } catch (err) {
        throw 'Illegal Manifest.'
    }

    ['name', 'ver', 'entry', 'components', 'id'].forEach(field => {
        if (!(field in manifest)) {
            throw `Field "${field}" is required.`
        }
    })

    const entryPath = path.join(root, manifest.entry)
    if (!fs.existsSync(entryPath)) {
        throw 'Entry file not found.'
    }

    const components = manifest.components
    if (!Array.isArray(components)) {
        manifest.components = []
    }

    return manifest
}


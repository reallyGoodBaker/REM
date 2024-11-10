const fs = require('fs')
const path = require('path')
const { Data } = require('../utils/appPath/main')

const DataNodeModules = path.join(Data, 'node_modules')
const ExtensionRuntime = path.join(DataNodeModules, 'extension')

async function cp(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest)
    }

    fs.readdirSync(src).forEach(name => {
        const srcPath = path.join(src, name)
        const destPath = path.join(dest, name)
        const stat = fs.statSync(srcPath)
        if (stat.isFile()) {
            fs.copyFileSync(srcPath, destPath)
            return
        }

        if (stat.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath)
            }

            cp(srcPath, destPath)
        }
    })
}

function initExtRuntime() {

    if (!fs.existsSync(ExtensionRuntime)) {
        fs.mkdirSync(DataNodeModules)
        fs.mkdirSync(ExtensionRuntime)
    }

    cp(
        path.resolve(__dirname, '../extension/runtime'),
        ExtensionRuntime
    )

    cp(
        path.resolve(__dirname, '../protocol_dist'),
        path.join(ExtensionRuntime, 'protocol')
    )
}

module.exports = {
    initExtRuntime
}
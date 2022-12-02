const {app} = require('electron')
const path = require('path')
const fs = require('fs')

const AppRoot = path.resolve(app.getPath('appData'), 'rem')

function pathResolve(name) {
    return path.resolve(AppRoot, name)
}

const DownloadPath = path.join(app.getPath('downloads'), 'rem')
const ExtVendor = path.join(__dirname, '../../extension/vendor')

const paths = [
    AppRoot,
    pathResolve('Data'),
    pathResolve('AppCache'),
    DownloadPath,
    pathResolve('Data/Extensions'),
    ExtVendor,
]

function mkdir(paths) {
    for (const filename of paths) {
        if (!fs.existsSync(filename)) {
            fs.mkdirSync(filename)
        }
    }
}

function savePath() {
    fs.writeFileSync(path.resolve(__dirname, './path'), paths.join('\n'))
}

mkdir(paths)

module.exports = {
    paths,
    AppRoot,
    Data: pathResolve('Data'),
    AppCache: pathResolve('AppCache'),
    Downloads: DownloadPath,
    Extensions: pathResolve('Data/Extensions'),
    ExtVendor,

    savePath
}
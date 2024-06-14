const { app, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const ProdPath = 'rem'
const AppRoot = path.resolve(app.getPath('appData'), ProdPath)

function pathResolve(name) {
    return path.resolve(AppRoot, name)
}

const DownloadPath = path.join(app.getPath('downloads'), ProdPath)
const Logs = app.getPath('logs')

const paths = [
    AppRoot,
    Logs,
    pathResolve('Data'),
    pathResolve('AppCache'),
    DownloadPath,
    pathResolve('Data/Extensions'),
]

function mkdir(paths) {
    for (const filename of paths) {
        if (!fs.existsSync(filename)) {
            fs.mkdir(filename, err => {
                if (err) {
                    fs.writeFileSync(
                        path.join(Logs, `${Date.now()}.log`),
                        err.stack
                    )
                }
            })
        }
    }
}

mkdir(paths)

const pathObj = {
    paths,
    AppRoot,
    Data: pathResolve('Data'),
    AppCache: pathResolve('AppCache'),
    Downloads: DownloadPath,
    Extensions: pathResolve('Data/Extensions'),
}

function savePath() {
    ipcMain.handle('paths?', (_, name) => {
        if (name && name in pathObj) {
            return pathObj[name]
        }

        return pathObj
    })
}

module.exports = Object.assign({ savePath }, pathObj)
const { app } = require('electron');
const path = require('path');
const fs = require('fs')


function mkdir(paths) {
    for (const filename of paths) {
        if (!fs.existsSync(filename)) {
            fs.mkdirSync(filename)
        }
    }
}

const AppRoot = path.resolve(app.getPath('appData'), 'rem')

function pathResolve(name) {
    return path.resolve(AppRoot, name)
}

const paths = [
    AppRoot,
    pathResolve('Data'),
    pathResolve('AppCache'),
    pathResolve('Download'),
]

mkdir(paths)

//将主要路径写入Path供preload使用
fs.writeFileSync('./Path', paths.join('\n'))


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


const buildMainWindow = require('./wins/build-main-window')
app.on('ready', () => {
    setTimeout(() => {
        buildMainWindow()
    }
        , process.platform == "linux" ? 1000 : 0
    )
})



require('./wins/binding')()

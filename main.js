const {app} = require('electron');
const path = require('path');
const fs = require('fs')


function mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}

const
    AppRoot = path.resolve(app.getPath('documents'), 'rem'),
    AppData = path.resolve(AppRoot, 'data'),
    AppCache = path.resolve(AppRoot, 'cache')

mkdir(AppRoot)
mkdir(AppData)
mkdir(AppCache)

//将主要路径写入Path供preload使用
fs.writeFileSync('./Path', `${AppData}\n${AppCache}`)




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

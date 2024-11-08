const {app} = require('electron')
const {savePath} = require('../../utils/appPath/main.js')

//将主要路径写入Path供preload使用
savePath()


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


const buildMainWindow = require('./buildWindow.js')
app.on('ready', () => {
    setTimeout(() => {
        buildMainWindow()
    }
        , process.platform == "linux" ? 1000 : 0
    )
})



const initBindings = require('./binding.js')
initBindings()
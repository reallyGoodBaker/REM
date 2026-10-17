const {app} = require('electron')
const {savePath} = require('../../utils/appPath/main.js')
const os = require('os')

// Windows 11 25H2/26H2 上，旧版 Electron 的 GPU 沙箱初始化可能触发
// STATUS_BREAKPOINT (0x80000003)，随后主进程收到 GPU process isn't usable。
// 该应用的窗口渲染器本身已显式关闭 sandbox，这里只关闭 GPU sandbox，
// 保留普通渲染器的现有启动方式。
const windowsBuild = process.platform === 'win32'
    ? Number(os.release().split('.')[2])
    : 0

if (windowsBuild >= 26200) {
    app.commandLine.appendSwitch('disable-gpu-sandbox')
}

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

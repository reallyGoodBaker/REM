const { app } = require('electron')
const path = require('path')
const { getLogger } = require('../../utils/easy-log/node')

const PROTOCOL = 'rem'

function setDefaultProtocol(scheme) {
    //判断系统
    if (process.platform === 'win32') {
        let args = []
        if (!app.isPackaged) {
            args.push(path.resolve(process.argv[1]))
        }
        //添加--防御自定义协议漏洞，忽略后面追加参数
        args.push('--')
        if (!app.isDefaultProtocolClient(scheme, process.execPath, args)) {
            app.setAsDefaultProtocolClient(scheme, process.execPath, args)
        }
    }
    else {
        if (!app.isDefaultProtocolClient(scheme)) {
            app.setAsDefaultProtocolClient(scheme)
        }
    }
}

const protocolHandlers = new Map()

function registerHandler(action, handler) {
    protocolHandlers.set(action, handler)
}

function unregisterHandler(action) {
    protocolHandlers.delete(action)
}

const handleWinOpen = () => {
    const protocolVal = process.argv.find(arg => arg.startsWith(PROTOCOL))
    
    if (!protocolVal) {
        return
    }

    handleUrl(protocolVal)
}

const handleUrl = url => {
    const [ _, pathUrl ] = url.split('://')
    const [ action, ...args ] = pathUrl.split('/')
    const handler = protocolHandlers.get(action)

    if (typeof handler === 'function') {
        handler.apply(undefined, args)
    }
}

function registerProtocol() {
    app.removeAsDefaultProtocolClient(PROTOCOL)
    setDefaultProtocol(PROTOCOL)

    app.on('ready', handleWinOpen)
    app.on('second-instance', () => {
        if (process.platform === 'win32') {
            handleWinOpen()
        }
    })
    app.on('open-url', (ev, url) => {
        ev.preventDefault()
        handleUrl(url)
    })
}

module.exports = {
    registerProtocol,
    registerHandler,
    unregisterHandler,
}
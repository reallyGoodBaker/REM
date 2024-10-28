const { ipcMain } = require('electron')
const { registerHandler } = require('../../wins/main/protocol')
const fetch = require('node-fetch')
const { tar } = require('compressing')
const fs = require('fs')
const { Extensions } = require('../../utils/appPath/main')
const { defaultLogger } = require('../easy-log/node')
const path = require('path')
const bus = require('../bus')
const { promiseResolvers } = require('../high-level/node/promise')

const defaultRoot = 'https://remext.rgb39.top/'

let marketRoot = defaultRoot

function getMarketRoot() {
    return marketRoot
}

function setMarketRoot(root) {
    marketRoot = root
}

async function getList() {
    return await (await fetch(path.join(marketRoot, 'index.json'))).json()
}

async function getManifest(name) {
    const manifestPath = path.join(marketRoot, 'src', name, 'manifest.json')
    return await (await fetch(manifestPath)).json()
}

async function install(name) {
    return new Promise(resolve => {
        const filePath = `${marketRoot}dist/${name}`
        const net = filePath.startsWith('https') ? require('https') : require('http')
        net.get(filePath, async res => {
            try {
                await tar.uncompress(res, Extensions)
                resolve(JSON.parse(fs.readFileSync(path.join(Extensions, name, 'manifest.json'))))
                bus.emit('extension:install', name)
            } catch (error) {
                resolve(false)
            }
        })  
    })
}

async function uninstall(id) {
    const { promise, resolve } = promiseResolvers()
    bus.emit('extension:uninstall', id, resolve)

    return promise
}

function initMarket() {
    ipcMain.handle('ext-market?root', getMarketRoot)
    ipcMain.handle('ext-market?manifest', (_, name) => getManifest(name))
    ipcMain.handle('ext-market:set-root', (_, root) => setMarketRoot(root))
    ipcMain.handle('ext-market?list', getList)
    ipcMain.handle('ext-market:install', (_, name) => install(name))
    ipcMain.handle('ext-market:uninstall', (_, name) => uninstall(name))

    registerHandler('ext', async (action, name) => {
        if (action === 'install') {
            defaultLogger.log(await install(name))
        }

        if (action === 'list') {
            defaultLogger.log(await getList(name))
        }
    })
}

module.exports = {
    initMarket
}
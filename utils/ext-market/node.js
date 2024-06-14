const { ipcMain } = require('electron')
const { registerHandler } = require('../../wins/main/protocol')
const fetch = require('node-fetch')
const { tar } = require('compressing')
const https = require('https')
const fs = require('fs')
const { Extensions } = require('../../utils/appPath/main')
const { defaultLogger } = require('../easy-log/node')
const marketRoot = 'https://reallygoodbaker.github.io/REM-Extensions/'

async function getList() {
    return await (await fetch(marketRoot)).json()
}

async function install(name) {
    return new Promise(resolve => {
        https.get(`${marketRoot}dist/${name}`, async res => {
            try {
                await tar.uncompress(res, fs.createWriteStream(`${Extensions}/${name}`))
                resolve(true)
            } catch (error) {
                resolve(false)
            }
        })  
    })
}

function initMarket() {
    ipcMain.handle('ext-market?list', getList)
    ipcMain.handle('ext-market:install', (_, name) => install(name))

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
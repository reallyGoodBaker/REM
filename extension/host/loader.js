const { ExtensionHost } = require('./host')
const { ipcMain, BrowserWindow } = require('electron')
const { Data } = require('../../utils/appPath/main')
const path = require('path')
const { open } = require('../../utils/stores/configurator')
const fs = require('fs')
const crypto = require('crypto')

class ExtensionLoader {

    config = open(path.join(Data, 'extensions.json'))
    extensions = new Map()
    failed = new Set()

    /**
     * @param {string} folder 
     * @param {BrowserWindow} bw 
     */
    constructor(folder, bw) {
        this.root = folder
        this.bw = bw

        fs.readdirSync(folder).forEach(extFolder => {
            const filePath = path.join(folder, extFolder)
            if (!fs.statSync(filePath).isDirectory()) {
                return
            }

            const host = new ExtensionHost(filePath)
            
            if (!host.error) {
                this.extensions.set(host.manifest.id, host)

                const m = host.manifest
                m.folderName = extFolder

                ipcMain.on('win:loaded', () => {
                    bw.webContents.send('extension:loaded', m)
                })
            } else {
                host.kill(0)
                this.failed.add(extFolder)

                ipcMain.on('win:loaded', () => {
                    bw.webContents.send('notification:send', {
                        uuid: crypto.randomUUID(),
                        title: '加载错误',
                        message: `${extFolder} 加载失败:\n${host.error.toString()}`,
                        channel: crypto.randomUUID(),
                        timeout: -1,
                        icon: '\ue000',
                    })
                })
            }
        })

        this._listenExtensionsChange()
    }

    enumIds() {
        return Array.from(this.extensions.keys())
    }

    start = id => {
        /**
         * @type {ExtensionHost}
         */
        let host
        if (host = this.extensions.get(id)) {
            if (host.extension) {
                return
            }

            host.initExtension(this.bw)

            this.config.assign({ [id]: true })
            this.config.commit()
        }
    }

    _listenExtensionsChange() {
        ipcMain.on('extension:active', (_, id) => this.start(id))
        ipcMain.on('extension:deactive', (_, id) => this._deactiveExtension(id))
    }

    _deactiveExtension = id => {
        let host
        if (host = this.extensions.get(id)) {
            host.kill()

            this.config.assign({ [id]: false })
            this.config.commit()
        }
    }

}

/**
 * 
 * @param {*} folder 
 * @param {BrowserWindow} bw 
 * @returns 
 */
function loadExtensions(folder, bw) {
    const loader = new ExtensionLoader(folder, bw)
    const config = loader.config.clone()

    for (const id of loader.enumIds()) {
        if (config[id]) {
            loader.start(id)
        }
    }

    ipcMain.on('extension-ui:config?', e => {
        e.sender.send('extension-ui:config', config)
    })

    return loader
}

function loaderBuilder(bw) {
    return folder => loadExtensions(folder, bw)
}

module.exports = {
    ExtensionLoader, loadExtensions, loaderBuilder
}
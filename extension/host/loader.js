const { ExtensionHost } = require('./host')
const { ipcMain, BrowserWindow } = require('electron')
const { Data } = require('../../utils/appPath/main')
const path = require('path')
const { open } = require('../../utils/stores/configurator')
const fs = require('fs')
const crypto = require('crypto')
const bus = require('../../utils/bus')

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

        fs.readdirSync(folder).forEach(this.loadExt)

        this._listenExtensionsChange()

        bus.on('extension:install', this.loadExt)
        bus.on('extension:uninstall', (id, resolve) => {
            const name = this.extensions.get(id)?.manifest?.folderName
            if (!name) {
                return resolve(false)
            }

            try {
                this.rmExt(name)
                resolve(true)
            } catch (error) {
                resolve(false)
            }
        })
    }

    loadExt = extFolder => {
        const filePath = path.join(this.root, extFolder)
        if (!fs.statSync(filePath).isDirectory()) {
            return
        }

        const host = new ExtensionHost(filePath)
        
        if (!host.error) {
            this.extensions.set(host.manifest.id, host)

            const m = host.manifest
            m.folderName = extFolder

            ipcMain.on('win:loaded', () => {
                this.bw.webContents.send('extension:loaded', m)
            })
        } else {
            host.kill(0)
            this.failed.add(extFolder)

            ipcMain.on('win:loaded', () => {
                this.bw.webContents.send('notification:send', {
                    uuid: crypto.randomUUID(),
                    title: '加载错误',
                    message: `${extFolder} 加载失败:\n${host.error.toString()}`,
                    channel: crypto.randomUUID(),
                    timeout: -1,
                    icon: '\ue000',
                })
            })
        }
    }

    rmExt = extFolder => {
        const filePath = path.join(this.root, extFolder)
        if (!fs.statSync(filePath).isDirectory()) {
            return
        }

        const { id } = JSON.parse(fs.readFileSync(path.join(filePath, 'manifest.json')))
        this._deactiveExtension(id)
        this.config.remove(id)
        this.config.commit()
        this.extensions.delete(id)
    
        fs.rmSync(filePath, { recursive: true, force: true })
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
        ipcMain.handle('extension?status', (_, extManifest) => {
            let ext
            if (!(ext = this.extensions.get(extManifest.id))) {
                return 1
            }

            const verQuery = extManifest.ver.split('.')
            const ver = ext.manifest.ver.split('.')
            if (verQuery.length > ver.length) {
                return 2
            }

            for (let i = 0; i < verQuery.length; i++) {
                if (verQuery[i] > ver[i]) {
                    return 2
                } else if (verQuery[i] < ver[i]) {
                    return -1
                }
            }

            return 0
        })
        fs.watch(this.root, (ev, file) => {
            console.log(ev, file)
        })
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
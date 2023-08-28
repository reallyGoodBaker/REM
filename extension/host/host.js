const { ipcMain } = require('electron')
const path = require('path')
const requireManifest = require('./manifestParser')
const { Worker, MessagePort } = require('worker_threads')
const { EventEmitter } = require('events')
const { X509Certificate } = require('crypto')
const { Blob } = require('buffer')
const serviceMap = require('./serviceMap')

class ExtensionHost {
    events = new EventEmitter()
    components = new Map()

    /**
     * @param {string} folder
     */
    constructor(folder) {

        this.root = folder
        const manifestPath = path.join(folder, 'manifest.json')
        this.manifest = requireManifest(manifestPath)

        this.events.setMaxListeners(Infinity)
        this.events.on('internal-error', err => {
            console.error(err)
        })
    }

    _registerExtensionWorker = () => {

        const ext = this.extension = new Worker(
            path.join(this.root, this.manifest.entry)
        )

        ext.on('message', v => {

            if ('name' in v && 'args' in v) {
                this.events.emit(`@${v.name}`, v)
                return
            }

            if ('uid' in v && 'val' in v && 'err' in v) {
                let handler = this.requests.get(v.uid)
                return handler.call(undefined, v)
            }

            this.events.emit('message', v)
        })

        return ext

    }

    requestId = 0
    requests = new Map()
    request(name, ...args) {
        if (!this.extension) {
            return
        }

        const uid = this.requestId++

        return new Promise((res, rej) => {
            const returnValHandler = ({ uid, val, err }) => {
                this.requests.delete(uid)

                if (err) {
                    return rej(err)
                }

                res(val)
            }

            this.requests.set(uid, returnValHandler)
            this.extension.postMessage({ uid, name, args }, this._buildTransList(args))
        })
    }

    /**
     * @param {BrowserWindow} bw 
     */
    initExtension(bw) {
        //const extWorker = 
        this._registerExtensionWorker()
        this._connectComponents(bw)
        this._registerComponents()
        this._registerActivationChange(bw)

        ipcMain.emit('extension:activated', this.manifest)
    }

    _registerActivationChange = bw => {
        const web = bw.webContents

        ipcMain.once('extension:activated', m => {
            m.activated = true
            web.send('extension:activated', m)
        })

        ipcMain.once('extension:deactivated', m => {
            m.activated = false
            web.send('extension:deactivated', m)
        })
    }

    _connectComponents(bw) {
        const components = this.manifest.components

        for (const name of components) {
            this._addComponent(name, bw)
        }
    }

    getComponent(name) {
        return this.components.get(name) || null
    }

    componentNames() {
        return this.components.keys()
    }

    _addComponent(name, bw) {
        if (typeof serviceMap[name] === 'undefined') {
            return
        }

        const component = this._initComponent(name, bw, this.extension)
        this.components.set(name, component)
    }

    _initComponent(name, ...args) {
        if (!this.manifest.components.includes(name)) {
            return
        }

        try {
            return serviceMap[name].apply(undefined, args)
        } catch (err) {
            this.events.emit('internal-error', err)
            return {}
        }
    }

    async kill(reason) {
        await this.request('beforeDisable')
        await this.request('clearTimers')

        const code = await this.extension.terminate()
        this.events.emit('kill', reason)
        this.events.emit('exit', code)
        this.events.emit('-service')
        this.extension = null

        ipcMain.emit('extension:deactivated', this.manifest)
    }

    _registerComponents = () => {
        for (const name of this.componentNames()) {
            let component
            if (component = this.components.get(name)) {
                this._registerComponent(component)
            }
        }
    }

    _registerComponent = (component) => {
        for (const key of this._getComponentKeys(component)) {
            const handler = async ({ args, id }) => {
                let val
                    ,err = val = null

                try {
                    val = await component[key].apply(component, args)
                } catch (er) {
                    err = er
                }

                if (typeof id === 'number' && this.extension) {
                    const returnVal = { id, val, err }
                    this.extension.postMessage(returnVal, this._buildTransList(returnVal))
                }
            }

            this.events.on(`@${key}`, handler)
            this.events.once(`-service`, () => {
                this.events.off(`@${key}`, handler)
            })
        }
    }

    _getComponentKeys = (component) => {
        if (typeof component.keys === 'function') {
            return component.keys()
        }

        if (Array.isArray(component.keys)) {
            return component.keys
        }

        return Reflect.ownKeys(component)
    }

    _buildTransList = (val) => {
        let transList = []

        for (const k in val) {
            const v = val[k]
            if (v instanceof ArrayBuffer
                || v instanceof MessagePort
                || v instanceof X509Certificate
                || v instanceof Blob
                || v instanceof EventEmitter && 'fd' in v
            ) {
                transList.push(v)
            }
        }

        return transList
    }


}

module.exports = {
    ExtensionHost
}
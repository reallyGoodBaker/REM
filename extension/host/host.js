const { app, ipcMain } = require('electron')
const path = require('path')
const requireManifest = require('./manifestParser')
const { Worker, MessagePort } = require('worker_threads')
const { EventEmitter } = require('events')
const { X509Certificate } = require('crypto')
const { Blob } = require('buffer')
const serviceMap = require('./serviceMap')
const { openWindow, destroyWindow, closeWindow, openExtensionWindows, closeExtensionWindows, openFallbackWindows, setMainWindow } = require('./win')
const { Data } = require('../../utils/appPath/main')
const { createThread, killThread } = require('./thread')

class ExtensionHost {
    events = new EventEmitter()
    components = new Map()
    error = null

    /**
     * @param {string} folder
     */
    constructor(folder) {
        this.root = folder
        const manifestPath = path.join(folder, 'manifest.json')
        try {
            this.manifest = requireManifest(manifestPath)
            this.events.setMaxListeners(Infinity)
            this.events.on('internal-error', err => {
                console.error(err)
            })
        } catch (err) {
            ipcMain.emit('extension:error', manifestPath, err)
            this.error = err
        }
    }

    _registerExtensionWorker = () => {

        const ext = this.extension = new Worker(
            path.join(this.root, this.manifest.entry),
            {
                env: {
                    ...process.env,
                    // 扩展运行目录位于 resources/builtin-extensions，不能用 process.cwd()
                    // 推断应用自身依赖的位置；显式传递 app.getAppPath() 供扩展创建稳定的 require。
                    REM_APP_PATH: app.getAppPath(),
                    NODE_PATH: [
                        path.join(app.getAppPath(), 'node_modules'),
                        path.join(Data, 'node_modules'),
                        process.env.NODE_PATH,
                    ].filter(Boolean).join(path.delimiter),
                },
            },
        )

        ext.on('error', err => {
            console.error(`[extension:${this.manifest.name}] worker error:`, err)
            this.events.emit('internal-error', err)
            ipcMain.emit('extension:deactive', this.manifest.id)
        })

        ext.on('messageerror', err => {
            console.error(`[extension:${this.manifest.name}] worker message error:`, err)
            ipcMain.emit('extension:deactive', this.manifest.id)
        })

        ext.on('message', v => {
            if ('name' in v && 'args' in v) {
                this.events.emit(`@${v.name}`, v)
                return
            }

            if ('uid' in v && 'val' in v && 'err' in v) {
                let handler = this.requests.get(v.uid)
                return handler?.call(undefined, v)
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
        setMainWindow(bw)
        this.bw = bw
        const manifest = this.manifest
        const { entry, components } = manifest

        if (components.includes('new_window')) {
            this._listenWindowEvents(manifest)
            openExtensionWindows(manifest)
            openFallbackWindows(manifest)
        }

        if (components.includes('threads')) {
            this._listenThreadEvents(manifest)
        }

        if (entry) {
            this._connectComponents(bw)
            this._registerComponents()
            this._registerExtensionWorker()
        }

        this.events.on('@@@ready', ({ id }) => {
            this.extension.postMessage({ id, val: globalThis.playerReady, err: null })
        })

        manifest.activated = true
        const activeManifest = { ...manifest }
        ipcMain.emit('extension:activated', activeManifest)
        bw.webContents.send('extension:activated', activeManifest)

        const notifyReady = () => {
            if (!this.extension) {
                return
            }

            this.request('ready').catch(() => {})
        }

        if (globalThis.playerReady) {
            setImmediate(notifyReady)
            setTimeout(notifyReady, 250)
        } else {
            ipcMain.once('win:show-main', notifyReady)
        }
    }

    sameId(m) {
        return m.id === this.manifest.id
    }

    _notifyDeactivated() {
        this.manifest.activated = false
        const inactiveManifest = { ...this.manifest }
        ipcMain.emit('extension:deactivated', inactiveManifest)
        this.bw?.webContents.send('extension:deactivated', inactiveManifest)
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

        const component = this._initComponent(name, bw, this.extension, this.manifest)
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
            return Object.prototype
        }
    }

    kill(reason) {
        if (!this.stopping) {
            this.stopping = this._kill(reason).finally(() => this.stopping = null)
        }
        return this.stopping
    }

    async _kill(reason) {
        this.manifest.activated = false
        closeExtensionWindows(this.manifest)

        if (this.extension) {
            const worker = this.extension
            let cleanupTimer

            // Keep the worker connected for cleanup; a crashed worker must not block the switch.
            await Promise.race([
                (async () => {
                    try { await this.request('beforeDisable') } catch {}
                    try { await this.request('clearTimers') } catch {}
                })(),
                new Promise(resolve => cleanupTimer = setTimeout(resolve, 2000)),
            ])
            clearTimeout(cleanupTimer)
            this.extension = null

            try {
                await worker.terminate()
            } catch { /* worker may already be dead */ }

        }

        for (const component of this.components.values()) {
            component.dispose?.()
        }
        this.components.clear()
        this.requests.clear()
        this.events.emit('kill', reason)
        this.events.emit('exit', 0)
        this.events.emit('-service')
        this.events.eventNames()
            .filter(name => name !== 'internal-error')
            .forEach(name => this.events.removeAllListeners(name))

        this._notifyDeactivated()
    }

    _registerComponents = () => {
        for (const name of this.componentNames()) {
            let component
            if (component = this.components.get(name)) {
                this._registerComponent(component)
            }
        }
    }

    _registerComponent = component => {
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

    _listenWindowEvents = manifest => {
        const ev = this.events

        ev.on('@win:open', ({ id, args: [ file, options ] }) => {
            const uuid = openWindow(file, options, manifest)
            this.extension.postMessage({ id, val: uuid })
        })

        ev.on('@win:destroy', ({ id, args: [ uuid ] }) => {
            destroyWindow(uuid)
            this.extension.postMessage({ id })
        })

        ev.on('@win:close', ({ id, args: [ uuid ] }) => {
            closeWindow(uuid)
            this.extension.postMessage({ id })
        })
    }

    _listenThreadEvents = manifest => {
        const ev = this.events
        ev.on('@threads:create', ({ id, args: [ name ] }) => {
            const port = createThread(name, manifest)
            if (!port) {
                return
            }
            this.extension.postMessage({ id, val: port }, [port])
        })

        ev.on('@threads:kill', ({ id, args: [ name ] }) => {
            killThread(name)
            this.extension.postMessage({ id })
        })
    }

}

module.exports = {
    ExtensionHost
}

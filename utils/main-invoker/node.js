const { BrowserWindow, ipcMain } = require('electron')
const crypto = require('crypto')

class NodeInvoker {
    static invokes = new Map()

    /**
     * @param {BrowserWindow} bw 
     */
    constructor(bw) {
        this.web = bw.webContents
    }

    invoke(channel, ...args) {
        const invokeChannel = `[[@@${channel}]]`
        const invokeId = crypto.randomUUID()

        this.#registerInvokeReceiver(invokeChannel, invokeId)

        return new Promise((resolve, reject) => {
            const invokeHandler = ({ val, err }) => {
                if (err) return reject(err)

                removeInvokeHandler()
                resolve(val)
            }

            function removeInvokeHandler() {
                NodeInvoker.invokes.delete(invokeId)
            }

            NodeInvoker.invokes.set(invokeId, invokeHandler)

            setTimeout(() => {
                removeInvokeHandler()
                reject(new Error('Invoke timeout.'))
            }, 3000)

            this.web.send(invokeChannel, {
                id: invokeId,
                args,
            })
        })
    }

    #registerInvokeReceiver(channel, invokeId) {
        const invokeReceiver = (ev, res) => {
            if (res?.id !== invokeId) {
                return
            }

            ipcMain.off(channel, invokeReceiver)
            const invokeHandler = NodeInvoker.invokes.get(invokeId)

            if (typeof invokeHandler !== 'function') return

            invokeHandler.call(null, res)
        }

        ipcMain.on(channel, invokeReceiver)

        setTimeout(() => {
            ipcMain.off(channel, invokeReceiver)
        }, 3000)
    }
}

/**
 * @param {BrowserWindow} bw 
 */
function initInvokerService(bw) {
    return new NodeInvoker(bw)
}

module.exports = initInvokerService
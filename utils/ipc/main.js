const { server } = require('./net')
const { ipcMain } = require('electron')

let channels = new Map()

function removeSocketFromChannels(socket) {
    for (const subscribers of channels.values()) {
        subscribers.delete(socket)
    }
}

function safeWrite(socket, data) {
    if (!socket || socket.destroyed || socket.writableEnded) {
        return false
    }

    try {
        return socket.write(data)
    } catch (err) {
        if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
            removeSocketFromChannels(socket)
            return false
        }

        throw err
    }
}

function broadcast(channelName, data) {
    const channel = channels.get(channelName)
    if (!channel) {
        return
    }

    for (const socket of channel) {
        safeWrite(socket, data)
    }
}

function delegate(from, to) {
    ipcMain.on(from, (e, ...args) => {
        broadcast(to, JSON.stringify(args) + '\0')
    })
}

exports.write = function publish(channelName, buffer) {
    broadcast(channelName, buffer)
}

exports.publish = function publish(channelName, ...args) {
    broadcast(channelName, JSON.stringify(args) + '\0')
}

exports.init = () => {
    delegate('win:playstate', 'playstate')
    delegate('win:player', 'player')
    delegate('ext:settings-changed', 'ext-settings')

    server('subscribe', s => {
        s.on('data', data => {
            const channelStr = data.toString('utf-8')

            let channel = channels.get(channelStr)
            if (!channel) {
                channel = new Set()
                channels.set(channelStr, channel)
            }

            channel.add(s)
        })

        const cleanup = () => removeSocketFromChannels(s)
        s.on('close', cleanup)
        s.on('end', cleanup)
        s.on('error', cleanup)
    })

    /**
     * @type {import('net').Socket}
     */
    let singletonOutput
    server('pcm-stream-broker', s => {
        singletonOutput = s
        s.on('close', () => {
            if (singletonOutput === s) {
                singletonOutput = null
            }
        })
        s.on('error', () => {
            if (singletonOutput === s) {
                singletonOutput = null
            }
        })
    })

    let pluginOutput = false
    ipcMain.on('output:setPluginOutput', (_, o) => pluginOutput = o)

    ipcMain.on('pcm', (_, /**@type {Float32Array}*/ buffer) => {
        if (!pluginOutput) {
            return
        }
        const len = buffer.length
        const buf = new Float32Array(len)

        const c0 = buffer.slice(0, len >> 1),
            c1 = buffer.slice(len >> 1)

        for (let i = 0; i < c0.length; i++) {
            buf[i << 1] = c0[i]
            buf[(i << 1) + 1] = c1[i]
        }

        if (singletonOutput) {
            safeWrite(singletonOutput, Buffer.from(buf.buffer))
        }
    })
}

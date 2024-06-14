const { server } = require('./net')
const { ipcMain } = require('electron')

let channels = new Map()

function delegate(from, to) {
    ipcMain.on(from, (e, ...args) => {
        const channel = channels.get(to)
        if (channel) {
            channel.forEach(s => {
                s.write(JSON.stringify(args) + '\0')
            })
        }
    })
}

exports.write = function publish(channelName, buffer) {
    const channel = channels.get(channelName)
    if (channel) {
        channel.forEach(s => {
            s.write(buffer)
        })
    }
}

exports.publish = function publish(channelName, ...args) {
    const channel = channels.get(channelName)
    if (channel) {
        channel.forEach(s => {
            s.write(JSON.stringify(args) + '\0')
        })
    }
}

exports.init = () => {
    delegate('win:playstate', 'playstate')
    delegate('win:player', 'player')

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
    })

    /**
     * @type {import('net').Socket}
     */
    let singletonOutput
    server('pcm-stream-broker', s => {
        singletonOutput = s
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
            singletonOutput.write(Buffer.from(buf.buffer))
        }
    })
}
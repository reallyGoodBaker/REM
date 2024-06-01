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

module.exports = () => {
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
}
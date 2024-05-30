const { provide } = require('./net')
const { ipcMain } = require('electron')

let channels = new Map()

module.exports = () => {
    ipcMain.on('win:playstate', (e, ...args) => {
        const channel = channels.get('playstate')
        if (channel) {
            channel.forEach(s => {
                s.write(JSON.stringify(args) + '\0')
            })
        }
    })

    provide('subscribe', s => {
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
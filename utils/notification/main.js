const crypto = require('crypto')
const { ipcMain } = require('electron')

const prop = name => 'notification:' + name

function notificationService(bw, ext) {
    const web = bw.webContents
    const notifSend = prop('send'),
        notifCallback = prop('callback')
    const callbackMap = new Map()

    const handleNotifCallback = (_, {active, uuid}) => {
        let handler
        if (typeof (handler = callbackMap.get(uuid)) === 'function') {
            handler.call(undefined, active)
            callbackMap.delete(uuid)
        }
    }

    ipcMain.on(notifCallback, handleNotifCallback)

    function sendNotification(n) {
        const uuid = crypto.randomUUID()
        n.uuid = uuid

        web.send(notifSend, n)
        
        return new Promise(res => {
            callbackMap.set(uuid, v => res(v))
        })
    }

    return {
        [notifSend]: sendNotification,
        keys: () => [notifSend]
    }
}

module.exports = notificationService
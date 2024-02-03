import {rem} from '../rem.js'

export function notification(title='', message='', icon='', timeout=10000, channel='', controls=[]) {
    return {
        title,
        message,
        icon,
        timeout,
        channel,
        controls
    }
}

export function notify(notification) {
    rem.emit('notification:send', notification)
}

export function initCrossThreadNotification() {
    hooks.on('notification:send', (_, n) => {
        const {
            uuid,
            title,
            message,
            icon,
            timeout,
            channel,
            controls,
        } = n

        const notif = notification(title, message, icon, timeout, channel, controls)

        const handler = i => {
            hooks.send('notification:callback', {active: i, uuid})
        }

        notif.controls.forEach((btn, i) => {
            btn.onClick = () => handler(i)
        })

        notif.onCancel = () => handler(-1)
        notif.onConfig = () => handler(-2)

        notify(notif)
    })
}
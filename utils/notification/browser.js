import {rem} from '../rem.js'

export function notification(title='', message='', icon='\ue758', timeout=10000, controls=[]) {
    return {
        title,
        message,
        icon,
        timeout,
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
            controls
        } = n

        const notif = notification(title, message, icon, timeout, controls)

        const handler = i => {
            hooks.send('notification:callback', {active: i, uuid})
        }

        notif.controls.forEach((btn, i) => {
            btn.onClick = () => handler(i)
        })

        notif.onCancel = () => handler(-1)

        notify(notif)
    })
}
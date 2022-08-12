import { NotificationWidget } from '../widget/notification/export.js'
import { injectService } from '../widget/base.js'

class NetworkStateWindow extends NotificationWidget {
    display() {
        this.popup({
            horizontal: 'right',
            vertical: 'bottom',
        })
    }
}

injectService.add(NetworkStateWindow)

export const networkErrorNotif = new NetworkStateWindow().setMessage('您似乎失去了与服务器的连接')
export const networkRecoverNotif = new NetworkStateWindow().setMessage('网络已重新连接')

export function initNetworkWatcher() {
    hooks.on('online', online => triggerOnlineStateChange(true))
    hooks.on('offline', online => triggerOnlineStateChange(false))
}

function triggerOnlineStateChange(online) {

    if (online) {
        return networkRecoverNotif.display()
    }

    networkErrorNotif.display()
}
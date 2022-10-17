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

export const networkChangeNotif = new NetworkStateWindow()

export function initNetworkWatcher() {
    hooks.on('online', () => networkChangeNotif.setMessage('网络已恢复').display())
    hooks.on('offline', () => networkChangeNotif.setMessage('网络连接出现问题').display())
}

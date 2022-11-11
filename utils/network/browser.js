import { NotificationWidget } from '../widget/notification/export.js'
import { injectService } from '../widget/base.js'
import { LifeCycle } from '../rem.js'

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

export async function initNetworkWatcher() {
    await LifeCycle.when('runtimeReady')

    const s = f => langMapping.s(f)
    hooks.on('online', () => networkChangeNotif.setMessage(s('reconnected')).display())
    hooks.on('offline', () => networkChangeNotif.setMessage(s('disconnected')).display())
}

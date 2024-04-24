import { LifeCycle } from '../rem.js'
import { notify, notification } from '../notification/browser.js'


export async function initNetworkWatcher() {
    await LifeCycle.when('runtimeReady')
    const s = f => langMapping.s(f)

    hooks.on('online', () => notify(notification(s('notification'), s('reconnected'))))
    hooks.on('offline', () => notify(notification(s('notification'), s('disconnected'))))
}

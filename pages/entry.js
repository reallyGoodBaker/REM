import App from './App.svelte'

import { store } from '../utils/stores/base.js'
import { initNetworkWatcher } from '../utils/network/browser.js'
import { initAudioDevicesFind, watchAudioDeviceChange } from '../utils/devices/browser/find.js'
import { Lang } from '../utils/lang/lang.js'
import { rem, LifeCycle } from '../utils/rem.js'
import { initExtensionList } from '../extension/initExtensionList.js'
import { initCrossThreadNotification } from '../utils/notification/browser.js'
import { initSettings } from './settings/initSettings.js'
import { initHighLevelApi } from '../utils/high-level/browser'
import { loadExtensionUI } from '../extension/host/ui-loader'
import { initAppShortcut } from '../utils/shortcut/browser/app'

initHighLevelApi()

window.langMapping = new Lang(store.getSync('AppSettings/lang')?.selected || 'zh_cn')
window.contextMap = new Map()

rem.isBeta = true

initSettings()
initExtensionList()
loadExtensionUI()
initNetworkWatcher()
initAudioDevicesFind()
watchAudioDeviceChange()
initCrossThreadNotification()
initAppShortcut()

export default new App({
    target: document.body
})

async function initApp() {
    LifeCycle.fire('runtimeReady')

    hooks.on('win:focus', () => rem.emit('win:focus'))

    document.addEventListener('load', () => LifeCycle.fire('ready'))
}

initApp()
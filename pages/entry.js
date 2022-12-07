import App from './App.svelte';

import { store } from '../utils/stores/base.js'
import { initNetworkWatcher } from '../utils/network/browser.js'
import { initAudioDevicesFind, watchAudioDeviceChange } from '../utils/devices/browser/find.js'
import { Lang } from '../utils/lang/lang.js'
import { rem, LifeCycle } from '../utils/rem.js'
import { initExtensionList } from '../extension/initExtensionList.js'
import { initCrossThreadNotification } from '../utils/notification/browser.js'

window.langMapping = new Lang(store.getSync('AppSettings/lang')?.selected || 'zh_cn')
window.contextMap = new Map()

rem.isBeta = true

initExtensionList()
initNetworkWatcher()
initAudioDevicesFind() 
watchAudioDeviceChange()
initCrossThreadNotification()

export default new App({
    target: document.body
})

async function initApp() {
    LifeCycle.start()

    hooks.on('win:focus', () => rem.emit('win:focus'))
}

initApp()
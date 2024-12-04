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
import '../utils/audio-observer/audioPrivilege.js'

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

import { consumer, fileFindService } from '../protocol/renderer/index.js'
import { AudioTrack, songEncodeDecoder } from '../protocol/common/struct/audioTrack.js'
LifeCycle.when('controlsReady')
    .then(async () => {
        // 获得provider发现服务和remote provider构造器
        const [ lookup, create ] = consumer()
        // 获得满足分类的第一个provider descriptor
        const [ defaultProviderDescriptor ] = await lookup({ category: 'provider.song' })
        // 构造provider实例 (注意: 这里的create方法是remote provider构造器, 不是provider实例)
        // provider 运行在 node 环境下, 所以这里的remote provider实例是通过IPC通信实现功能的
        const defaultProvider = create(defaultProviderDescriptor, songEncodeDecoder)

        // await defaultProvider.write('1', new AudioTrack(
        //     [ 'Yellow' ],
        //     [ 'livetune' ],
        //     'こっち向いて Baby/Yellow',
        //     114514,
        //     'https://music.163.com/#/song?id=26115910',
        //     0,
        //     0
        // ))

        // await fileFindService.addDir('C:/Users/rgb/Music/albums/EVANGELION FINALLY')

        console.log(await defaultProvider.read('1'))
        console.log(
            await fileFindService.find(await fileFindService.getDirs())
        )
    })
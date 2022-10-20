<script>
import ScrollView from './components/ScrollView2.svelte'
import Input from './components/Input.svelte'
import RowList from './components/RowList.svelte';
import SelectListTile from './components/SelectListTile.svelte';
import ToggleListTile from './components/ToggleListTile.svelte';
import ListTile from './components/ListTile.svelte';
import { onDestroy, onMount, tick } from 'svelte';
import { getAudioDevices } from '../utils/devices/browser/find.js'
import { setOutputDeviceId, indexOfOutputDevice } from '../utils/devices/browser/output.js'


let settings = store.getSync('sys-settings')

let controlColors = settings.theme.controlColor.slice(1)
let controlColorSelected = settings.theme.controlColor[0]
let useAcrylic = settings.theme.useAcrylic
let showDevTools = settings.beta.showDevTools

function onToggleDevTools(ev) {
    const show = ev.detail
        ? 'open'
        : 'close'

    hooks.send(`devtools:${show}`)
}


function onSelectedControlColor(ev) {
    const i = ev.detail;
    controlColorSelected = settings.theme.controlColor[0] = i;
    rem.emit('changeControlColor', controlColors[controlColorSelected]);
    store.set('sys-settings', settings);
}

function onToggleUseAcrylic(ev) {
    const useAcrylic = ev.detail;
    settings.theme.useAcrylic = useAcrylic;
    rem.emit('useAcrylic', useAcrylic);
}

function clearCache() {
    store.clear()
}

function clearMusicCache() {

}

let [selectedRightRatio, ...rightStickRatios] = store.getSync('stickScrollSpeedRatio') || [
    1, {label: '慢', value: 0.3}, {label: '中', value: 0.65}, {label: '快', value: 1}
]
let [selectedLeftRatio, ...leftStickRatios] = store.getSync('cursorMoveSpeedRatio') || [
    1, {label: '慢', value: 0.3}, {label: '中', value: 0.65}, {label: '快', value: 1}
]
function onSelectStickSpeedRatio(ev) {
    const i = ev.detail
    selectedRightRatio = i
    store.set('stickScrollSpeedRatio', [i, ...rightStickRatios])
}
function onSelectCursorMoveSpeedRatio(ev) {
    const i = ev.detail
    selectedLeftRatio = i
    store.set('cursorMoveSpeedRatio', [i, ...leftStickRatios])
}

let scrollv
Pager.beforeSwitch(() => {
    if (scrollv?.prepared()) {
        const {save} = Pager.getContext()
        save.offsetRatio = scrollv.getOffsetRatio()
    }
})
onMount(async () => {
    const {save} = Pager.getContext()
    await tick()
    
    if (save.offsetRatio) {
        scrollv.setOffsetRatio(save.offsetRatio)
    }
    
})

let outputSelected = 0, outputDeviceList = []
async function updateOutputDeviceSelected() {
    outputDeviceList = [...(await getAudioDevices())]
    outputSelected = await indexOfOutputDevice(outputDeviceList)
}

rem.on('audioDeviceChange', updateOutputDeviceSelected)

onDestroy(() => {
    rem.off('audioDeviceChange', updateOutputDeviceSelected)
})

async function initOutputSetting() {
    const devices = await getAudioDevices()
    outputSelected = await indexOfOutputDevice(devices)
    return devices
}

onMount(async() => {
    outputDeviceList = await initOutputSetting()
})
</script>

<style>
    .c {
        justify-content: flex-start;
        align-items: flex-start;
    }

    .grid-margin {
        margin: 0px 24px;
    }

    h1 {
        font-weight: normal;
    }

</style>


<ScrollView bind:this={scrollv}><div class="row c">
    <div class="column grid-margin" style="justify-content: space-between; width: calc(100% - 48px)">
        <h1>设置</h1>
        <Input
            placeholder={"\ue6a8  搜索设置"}
            fullBorder={true}
        />
    </div>

    {#if window.rem.isBeta}
    <RowList title="测试功能">
        <ToggleListTile
            data='开发者工具'
            extra="开启或关闭 DevTools"
            useAvatar={false}
            isUrl={false}
            bind:checked={showDevTools}
            on:toggle={onToggleDevTools}
        />
    </RowList>
    {/if}

    <RowList title="主题">
        <SelectListTile
            data="主题色 (色相)"
            bind:dataList={controlColors}
            bind:selected={controlColorSelected}
            useAvatar={false}
            isUrl={false}
            on:selected={onSelectedControlColor}
        />
        <ToggleListTile
            data='使用 "Acrylic" '
            extra="性能较低的设备关闭此选项以获得更好的体验"
            useAvatar={false}
            isUrl={false}
            bind:checked={useAcrylic}
            on:toggle={onToggleUseAcrylic}
        />
    </RowList>

    <RowList title="缓存">
        <SelectListTile
            data="缓存音乐质量"
            bind:dataList={controlColors}
            bind:selected={controlColorSelected}
            useAvatar={false}
            isUrl={false}
            on:selected={onSelectedControlColor}
        />
        <ListTile
            useAvatar={false}
            data='清除用户信息'
            extra='需手动重启应用'
            on:click={clearCache}
        />
        <ListTile
            useAvatar={false}
            data='清除歌曲缓存'
            on:click={clearMusicCache}
        />
        
    </RowList>

    <RowList title="控制器">
        <SelectListTile
            data="页面滚动速度"
            bind:dataList={rightStickRatios}
            bind:selected={selectedRightRatio}
            useAvatar={false}
            isUrl={false}
            on:selected={onSelectStickSpeedRatio}
        />

        <SelectListTile
            data="指针移动速度"
            bind:dataList={leftStickRatios}
            bind:selected={selectedLeftRatio}
            useAvatar={false}
            isUrl={false}
            on:selected={onSelectCursorMoveSpeedRatio}
        />
    </RowList>


    <RowList title="输出">
        <SelectListTile
            data="设备"
            extra={'输出设备变化时将会切换到默认设备'}
            bind:dataList={outputDeviceList}
            bind:selected={outputSelected}
            useAvatar={false}
            isUrl={false}
            on:selected={async ev => {
                outputSelected = ev.detail
                setOutputDeviceId(outputDeviceList[ev.detail].deviceId)
            }}
        />
    </RowList>

</div></ScrollView>
<script>
import ScrollView from './components/ScrollView.svelte'
import Input from './components/Input.svelte'
import RowList from './components/RowList.svelte';
import SelectListTile from './components/SelectListTile.svelte';
import ToggleListTile from './components/ToggleListTile.svelte';
import ListTile from './components/ListTile.svelte';
import Popup from './components/Popup.svelte';


let settings = store.get('sys-settings')

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


<ScrollView><div class="row c">
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


</div></ScrollView>
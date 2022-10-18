<script>
    import TunnerTile from './TunnerTile.svelte'
    import {getAudioDevices} from '../../utils/devices/browser/find.js'
    import {indexOfOutputDevice} from '../../utils/devices/browser/output.js'
    import ScrollView from './ScrollView2.svelte'
    import {onMount} from 'svelte'
    import {AudioPlayer} from '../../utils/player/player.js'

    async function getDevice() {
        const devices = await getAudioDevices()
        return devices[await indexOfOutputDevice(devices)]
    }

    let metadata = Player.getMetadata()?.format

    let scrollv

    onMount(() => {
        scrollv.update()
        rem.on('metadata', data => {
            metadata = data.format
        })
    })
</script>


<style>
    .outerWindow {
        background-color: var(--controlBackground);
    }

    .btnGroup {
        box-sizing: border-box;
        padding: 0 12px;
        justify-content: space-between;
        height: 48px;
        background-color: var(--controlBrighter);
        width: 100%
    }

    em {
        font-style: normal;
        font-weight: bold;
        color: var(--controlBlack16);
        margin: 0 8px;
    }

    .link {
        cursor: pointer;
        text-decoration: none;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.1s;
    }

    .link:hover {
        text-decoration: underline;
    }

    .link:active {
        background-color: var(--controlGray);
    }

    .pair {
        flex-wrap: nowrap;
        align-items: flex-start;
    }
    .pair > .label {
        word-break: keep-all;
        margin-top: 4px;
    }
</style>

<div class="Column outerWindow" style="width: 300px; height: 72vh;">
<div class="Row" style="height: calc(72vh - 48px); margin-left: 12px;">
<ScrollView bind:this={scrollv}>
    <div class="Column" style="padding: 12px 0;">
    <TunnerTile
        title='输入'
        icon={'\ue936'}>
        {#if metadata}
        <div>编码 <em>{metadata.codec}</em></div>
        <div>音轨数 <em>{metadata.numberOfChannels}</em></div>
        <div>码率 <em>{~~(metadata.bitrate/10)/100} kBps</em></div>
        {#if metadata.bitsPerSample}
        <div>位深 <em>{metadata.bitsPerSample} bit</em></div>
        {/if}
        <div style="margin-bottom: 8px;">采样率 <em>{metadata.sampleRate/1000} kHz</em></div>
        <div>解码器 <em>内置 FFmpeg 解码器</em></div>
        {:else}
        无
        {/if}
    </TunnerTile>

    <!-- <TunnerTile
        title='双二阶滤波器'>
        略
    </TunnerTile>

    <TunnerTile
        title='增益'>
        1.2
    </TunnerTile> -->

    <TunnerTile
        hideLine={true}
        title='输出'
        icon={'\ue61e'}>
        <div>位深 <em>32bit Float</em></div>
        <div>频率 <em>{AudioPlayer.audioCtx.sampleRate/1000} kHz</em></div>
        {#await getDevice() then device}
        <div class="Row pair">
            <div class="label">设备</div>
            <em><div class="link">{device.label}</div></em>
        </div>
        {/await}
    </TunnerTile>
    </div>
</ScrollView>
</div>

<div class="Row btnGroup">
    <div class="btn big radius px4 light" on:click={() => {
        window.rem.emit('tunnerClose')
    }}>关闭</div>
    <div class="btn big radius px4 accent">应用</div>
</div>

</div>
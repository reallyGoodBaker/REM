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

    let processConfig = store.getSync('process')

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
        contain: paint;
        background-color: var(--controlBackground);
    }

    .btnGroup {
        box-sizing: border-box;
        padding: 0 12px;
        justify-content: space-between;
        height: 48px;
        border-top: solid 1px var(--controlGray);
        /* background-color: var(--controlBrighter); */
        width: 100%
    }

    em {
        font-style: normal;
        font-weight: bold;
        color: var(--controlBlack16);
        margin: 0 8px;
    }

    .link {
        display: flex;
        height: fit-content;
        min-height: 18px;
        line-height: 18px;
        align-items: center;
        cursor: pointer;
        text-decoration: none;
    }

    .link:hover {
        text-decoration: underline;
    }

    .link:active {
        background-color: var(--fade);
    }

    .pair {
        flex-wrap: nowrap;
        align-items: center;
    }
    .pair > .label {
        height: fit-content;
        min-height: 18px;
        word-break: keep-all;
        align-self: flex-start;
    }

    .tunnerPanel {
        background-color: var(--controlBrighter);
    }
</style>

<div class="Row" style="height: 72vh; width: 72vw;">

    <div class="Column outerWindow tunnerPanel" style="width: 300px;">
        <div class="Row" style="height: 72vh; margin-left: 12px;">
        <ScrollView bind:this={scrollv}>
            <div class="Column" style="padding: 12px 0;">
            <TunnerTile
                title='输入'
                icon={'\ue936'}>
                {#if metadata}
                <div>编码<em>{metadata.codec}</em></div>
                <div>音轨数<em>{metadata.numberOfChannels}</em></div>
                <div>码率<em>{~~(metadata.bitrate/10)/100} kBps</em></div>
                {#if metadata.bitsPerSample}
                <div>位深<em>{metadata.bitsPerSample} bit</em></div>
                {/if}
                <div style="margin-bottom: 8px;">采样率<em>{metadata.sampleRate/1000} kHz</em></div>
                <div>解码器<em>内置 FFmpeg 解码器</em></div>
                {:else}
                无
                {/if}
            </TunnerTile>

            <TunnerTile
                title='处理'>
                <div>位深<em>Float 32bit</em></div>
                <div>频率<em>{AudioPlayer.audioCtx.sampleRate/1000} kHz</em></div>
                <div class="Row pair">
                    <div class="label">增益</div>
                    <em><div class="link">{
                    processConfig.gain.gain > 1? '+': processConfig.gain.gain < 1? '-': ''
                    }{processConfig.gain.gain.toFixed(1)}</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">平衡</div>
                    <em><div class="link">{processConfig.stereoPanner.pan} ({
                        (1 - processConfig.stereoPanner.pan) / 2
                    }/{
                        (processConfig.stereoPanner.pan + 1) / 2
                    })</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">延迟</div>
                    <em><div class="link">{processConfig.delay.delayTime}s</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">淡入淡出</div>
                    <em><div class="link">{processConfig.fader.fadeIn}s / {processConfig.fader.fadeOut}s</div></em>
                </div>
            </TunnerTile>

            <TunnerTile
                hideLine={true}
                title='输出'
                icon={'\ue61e'}>
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
    </div>

    <div class="Column outerWindow" style="height: 100%; width: calc(72vw - 300px);">
        <div class="Column" style="height: calc(72vh - 48px);">

        </div>
        <div class="Row btnGroup">
            <div class="btn big radius px4 text" on:click={() => {
                window.rem.emit('tunnerClose')
            }}>关闭</div>
            <div class="btn big radius px4 light">应用</div>
        </div>
    </div>

</div>
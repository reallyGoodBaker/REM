<script>
    import TunnerTile from './TunnerTile.svelte'
    import {getAudioDevices} from '../../utils/devices/browser/find.js'
    import {indexOfOutputDevice} from '../../utils/devices/browser/output.js'
    import ScrollView from './ScrollView2.svelte'
    import {onDestroy, onMount} from 'svelte'
    import {AudioPlayer} from '../../utils/player/player.js'
    import Settings from '../Settings.svelte'
    import Gain from './TunnerComponents/Gain.svelte'
    import Delay from './TunnerComponents/Delay.svelte'
    import StereoPanner from './TunnerComponents/StereoPanner.svelte'
    import Fader from './TunnerComponents/Fader.svelte'

    async function getDevice() {
        const devices = await getAudioDevices()
        return devices[await indexOfOutputDevice(devices)]
    }

    let metadata = globalPlayer.getMetadata()?.format

    let processConfig = store.getSync('process')

    let scrollv, scrollContent

    function updateMetadata(data) {
        metadata = data.format
    }

    function updateProcessConf(data) {
        processConfig = data
    }

    onMount(() => {
        scrollv.update()
        scrollContent.update()
        rem.on('metadata', updateMetadata)
        rem.on('processUpdate', updateProcessConf)
    })

    onDestroy(() => {
        rem.off('metadata', updateMetadata)
        rem.off('processUpdate', updateProcessConf)
    })
</script>


<style>
    .outerWindow {
        contain: paint;
        background-color: var(--controlBackground);
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
        text-decoration: underline;
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

    .tunnerCard {
        width: calc(100% - 72px);
        margin: 0 24px;
        margin-top: 24px;
        padding: 12px;
        border-radius: 12px;
        background-color: var(--controlBrighter);
    }

    .bottomGroup {
        box-sizing: border-box;
        height: 46px;
        width: 100%;
        justify-content: flex-end;
        border-top: solid 1px var(--controlGray);
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
                    }{processConfig.gain.gain.toFixed(2)}</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">平衡</div>
                    <em><div class="link">{processConfig.stereoPanner.pan.toFixed(2)} ({
                        ((1 - processConfig.stereoPanner.pan) / 2).toFixed(2)
                    }/{
                        ((processConfig.stereoPanner.pan + 1) / 2).toFixed(2)
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
                    <em><div class="link" on:click={() => {
                        window.rem.emit('tunnerClose')
                        window.Pager.openNew('设置', Settings)
                    }}>{device.label}</div></em>
                </div>
                {/await}
            </TunnerTile>
            </div>
        </ScrollView>
        </div>
    </div>

    <div class="Column outerWindow" style="height: 100%; width: calc(72vw - 300px);">
        <div class="Column" style="height: calc(72vh - 48px); width: 100%;">
            <ScrollView bind:this={scrollContent}>
                <!-- <div style="height: 52px;"></div> -->
                
                <div class="tunnerCard">
                    <Gain/>
                    <StereoPanner/>
                    <Delay/>
                </div>

                <div class="tunnerCard">
                    <Fader/>
                </div>

            </ScrollView>
        </div>
        <div class="Row bottomGroup" style="padding: 0 12px;">
            <div class="btn big radius px4 accent" on:click={() => {
                window.rem.emit('tunnerClose')
            }}>完成</div>
        </div>
    </div>

</div>
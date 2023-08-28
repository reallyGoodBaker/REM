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
    import Equalizer from './TunnerComponents/Equalizer.svelte'
    import ToggleListTile from './ToggleListTile.svelte'
    import DynamicCompressor from './TunnerComponents/DynamicCompressor.svelte';
    import {setEqEnable} from '../../utils/player/process.js'
    import {store} from '../../utils/stores/base.js'
    import { rem } from '../../utils/rem.js'

    const s = f => langMapping.s(f)

    async function getDevice() {
        const devices = await getAudioDevices()
        return devices[await indexOfOutputDevice(devices)]
    }

    function closeTunner() {
        rem.emit('tunnerClose')
    }

    let metadata = AudioPlayer.getMetadata()?.format

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


    let eqCanvas
        ,eqCtx
        ,eqW
        ,eqH
        ,computed
    
    onMount(() => {
        eqCtx = eqCanvas.getContext('2d')
        eqH = eqCanvas.height
        eqW = eqCanvas.width
        computed = getComputedStyle(document.body)
        eqCtx.translate(0.5, 0.5);
        renderEq()

        rem.on('eqChange', () => renderEq())
    })

    function curveCtx() {
        eqCtx.strokeStyle = computed.getPropertyValue('--controlDark')
        eqCtx.lineWidth = 2
        eqCtx.lineCap = "round"
        eqCtx.lineJoin = "round"
    }

    function commentCtx() {
        eqCtx.strokeStyle = computed.getPropertyValue('--controlGray')
        eqCtx.lineWidth = 1
        eqCtx.lineCap = "miter"
        eqCtx.lineJoin = "round"
    }

    function renderEq() {
        if (!processConfig || !eqCtx) {
            return
        }

        const eq = processConfig.eq

        let curveY = 0, curveY2 = 0

        eqCtx.clearRect(-1, -1, eqW + 1, eqH + 1)
        commentCtx()
        eqCtx.beginPath()
        eqCtx.moveTo(0, 41)
        eqCtx.lineTo(180, 41)
        eqCtx.stroke()
        eqCtx.closePath()

        eqCtx.beginPath()
        curveCtx()
        if (!processConfig.eq.enable) {
            eqCtx.strokeStyle = computed.getPropertyValue('--controlBlack')
        }
        curveY = 41 - eq[31]*2
        eqCtx.moveTo(0, curveY)
        curveY2 = 41 - eq[62]*2
        eqCtx.bezierCurveTo(10, curveY, 10, curveY2, 20, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[125]*2
        eqCtx.bezierCurveTo(30, curveY, 30, curveY2, 40, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[250]*2
        eqCtx.bezierCurveTo(50, curveY, 50, curveY2, 60, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[500]*2
        eqCtx.bezierCurveTo(70, curveY, 70, curveY2, 80, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[1000]*2
        eqCtx.bezierCurveTo(90, curveY, 90, curveY2, 100, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[2000]*2
        eqCtx.bezierCurveTo(110, curveY, 110, curveY2, 120, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[4000]*2
        eqCtx.bezierCurveTo(130, curveY, 130, curveY2, 140, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[8000]*2
        eqCtx.bezierCurveTo(150, curveY, 150, curveY2, 160, curveY2)
        curveY = curveY2
        curveY2 = 41 - eq[16000]*2
        eqCtx.bezierCurveTo(170, curveY, 170, curveY2, 180, curveY2)
        eqCtx.stroke()
        eqCtx.closePath()
    }

    function onEqEnableChange({detail}) {
        setEqEnable(detail)
    }
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

    .marginBottom {
        margin-bottom: 24px;
    }

    .bottomGroup {
        box-sizing: border-box;
        height: 46px;
        width: 100%;
        justify-content: flex-end;
        border-top: solid 1px var(--controlGray);
    }

    #eqCanvas {
        height: 73px;
        width: 200px;
        border: solid 1px var(--controlGray);
        border-radius: 8px;
    }

</style>

<div class="Row" style="height: 72vh; width: 72vw;">

    <div class="Column outerWindow tunnerPanel" style="width: 300px;">
        <div class="Row" style="height: 72vh; margin-left: 12px;">
        <ScrollView bind:this={scrollv} hoverToShow={true} cssText='height: 498px;'>
            <div class="Column" style="padding: 12px 0;">
            <TunnerTile
                title={s('input')}
                icon={'\ue936'}>
                {#if metadata}
                <div>{s('codec')}<em>{metadata.codec}</em></div>
                <div>{s('num_of_tracks')}<em>{metadata.numberOfChannels}</em></div>
                {#if metadata.bitrate > 0}
                <div>{s('bitrate')}<em>{~~(metadata.bitrate/10)/100} kBps</em></div>
                {/if}
                {#if metadata.bitsPerSample}
                <div>{s('bit_length')}<em>{metadata.bitsPerSample} bit</em></div>
                {/if}
                <div style="margin-bottom: 8px;">{s('sample_rate')}<em>{metadata.sampleRate/1000} kHz</em></div>
                <div>{s('decoder')}<em>{`${s('builtin')} FFmpeg ${s('decoder')}`}</em></div>
                {:else}
                {s('none')}
                {/if}
            </TunnerTile>

            <TunnerTile
                title={s('processing')}>
                <div>{s('bit_length')}<em>Float 32bit</em></div>
                <div>{s('frequency')}<em>{AudioPlayer.audioCtx.sampleRate/1000} kHz</em></div>
                <div class="Row pair">
                    <div class="label">{s('gain')}</div>
                    <em><div class="link">{
                    processConfig.gain.gain > 1? '+': processConfig.gain.gain < 1? '-': ''
                    }{processConfig.gain.gain.toFixed(2)}</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">{s('stereo_pan')}</div>
                    <em><div class="link">{processConfig.stereoPanner.pan.toFixed(2)} ({
                        ((1 - processConfig.stereoPanner.pan) / 2).toFixed(2)
                    }/{
                        ((processConfig.stereoPanner.pan + 1) / 2).toFixed(2)
                    })</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">{s('delay')}</div>
                    <em><div class="link">{(processConfig.delay.delayTime).toFixed(2)}s</div></em>
                </div>

                <div class="Row pair">
                    <div class="label">{s('fade_in_and_out')}</div>
                    <em><div class="link">{(processConfig.fader.fadeIn).toFixed(2)}s / {(processConfig.fader.fadeOut).toFixed(2)}s</div></em>
                </div>

                <div class="Column pair">
                    <div class="label" style="margin-top: 8px;">{s('equalizer')}{!processConfig.eq.enable? `  (${s('disabled')})`: ''}</div>
                    <canvas style="align-self: flex-start; margin-bottom: 8px;" bind:this={eqCanvas} id="eqCanvas" width="180" height="82"></canvas>
                </div>

                <div class="Row pair">
                    <div class="label">{s('dynamic_compressor')}</div>
                    <em><div class="link">{processConfig.dynamicsCompressor? s('enabled'): s('disabled')}</div></em>
                </div>
            </TunnerTile>

            <TunnerTile
                hideLine={true}
                title={s('output')}
                icon={'\ue61e'}>
                {#await getDevice() then device}
                <div class="Row pair">
                    <div class="label">{s('device')}</div>
                    <em><div class="link" on:click={() => {
                        rem.emit('tunnerClose')
                        window.Pager.openNew('$settings', Settings)
                    }}>{device.label}</div></em>
                </div>
                {/await}
            </TunnerTile>
            </div>
        </ScrollView>
        </div>
    </div>

    <div class="Column outerWindow" style="height: 100%; width: calc(72vw - 300px);">
        <div class="Column" style="height: calc(72vh - 48px); width: 100%; position: relative;">
            <ScrollView bind:this={scrollContent} hoverToShow={true}>
                
                <div class="tunnerCard">
                    <Gain/>
                    <StereoPanner/>
                    <Delay/>
                </div>

                <div class="tunnerCard">
                    <Fader/>
                </div>

                <div class="tunnerCard">
                    <ToggleListTile
                        clickable={false}
                        data={s('enable_eq')}
                        useAvatar={false}
                        bind:checked={processConfig.eq.enable}
                        on:toggle={onEqEnableChange}
                    />
                    <div class="Row">
                        <Equalizer bind:enable={processConfig.eq.enable}/>
                    </div>
                </div>

                <div class="tunnerCard">
                    <DynamicCompressor/>
                </div>

                <div class="marginBottom"></div>

            </ScrollView>
        </div>
        <div class="Row bottomGroup" style="padding: 0 12px;">
            <div class="btn big radius px4 accent" on:click={closeTunner}>{s('done')}</div>
        </div>
    </div>

</div>
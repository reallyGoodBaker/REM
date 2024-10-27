<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import { getAudioDevices } from '../../utils/devices/browser/find.js'
    import { setOutputDeviceId, indexOfOutputDevice } from '../../utils/devices/browser/output.js'
    import { onDestroy, onMount } from "svelte";
    import ToggleListTile from '../components/ToggleListTile.svelte'
    import { store } from '../../utils/stores/base'

    import { rem } from '../../utils/rem.js'
    import { enableAnc } from '../../utils/player/anc.js'

    $: lang = window.langMapping

    let outputSelected = 0, outputDeviceList = []
    async function updateOutputDeviceSelected() {
        outputDeviceList = [...(await getAudioDevices())]
        outputSelected = await indexOfOutputDevice(outputDeviceList)
        rem.emitNone('setOutputDevice', outputDeviceList[outputSelected])
    }

    onDestroy(() => {
        rem.off('audioDeviceChange', updateOutputDeviceSelected)
    })

    async function initOutputSetting() {
        const devices = await getAudioDevices()
        outputSelected = await indexOfOutputDevice(devices)
        return devices
    }

    onMount(async() => {
        rem.on('audioDeviceChange', updateOutputDeviceSelected)
        outputDeviceList = await initOutputSetting()
    })

    let useAnc = false
    let { pluginOutput, sampleRate } = store.getSync('AppSettings/output')

    function save() {
        store.set('AppSettings/output', { pluginOutput, sampleRate })
    }

    function onUseAnc({detail}) {
        useAnc = false
        //enableAnc(detail)
    }

    const sampleRates = [ 0, 44100, 48000, 96000, 192000, 384000 ]
    $: _sampleRates = [ { label: 'auto' }, 44100, 48000, 96000, 192000, 384000 ]
    $: sampleRateSelected = sampleRates.indexOf(sampleRate)
</script>

<RowList title={lang.s('output')}>
    <SelectListTile
        data={lang.s('device')}
        extra={lang.s('device_extra')}
        bind:dataList={outputDeviceList}
        bind:selected={outputSelected}
        useAvatar={false}
        isUrl={false}
        on:selected={async ev => {
            outputSelected = ev.detail
            setOutputDeviceId(outputDeviceList[ev.detail].deviceId)
        }}
    />
    <ToggleListTile
        data={lang.s('output')}
        extra={lang.s('plugin_output')}
        useAvatar={false}
        isUrl={false}
        bind:checked={pluginOutput}
        on:toggle={({ detail }) => {
            rem.emitNone('setPluginOutput', detail)
            save()
        }}
    />
    <SelectListTile
        data={lang.s('sample_rate')}
        dataList={_sampleRates}
        bind:selected={sampleRateSelected}
        useAvatar={false}
        isUrl={false}
        on:selected={async ev => {
            sampleRate = sampleRates[ev.detail]
            save()
        }}
    />
    <!-- {#if rem.isBeta}
    <ToggleListTile
        data={lang.s('anc')}
        extra={lang.s('anc_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={useAnc}
        on:toggle={onUseAnc}
    />
    {/if} -->
</RowList>
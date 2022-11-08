<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import { getAudioDevices } from '../../utils/devices/browser/find.js'
    import { setOutputDeviceId, indexOfOutputDevice } from '../../utils/devices/browser/output.js'
    import { onDestroy, onMount } from "svelte";
    import ToggleListTile from '../components/ToggleListTile.svelte'
    import {enableAnc} from '../../utils/player/anc.js'

    $: lang = window.langMapping

    let outputSelected = 0, outputDeviceList = []
    async function updateOutputDeviceSelected() {
        outputDeviceList = [...(await getAudioDevices())]
        outputSelected = await indexOfOutputDevice(outputDeviceList)
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

    function onUseAnc({detail}) {
        useAnc = false
        //enableAnc(detail)
    }
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
    {#if window.rem.isBeta}
    <ToggleListTile
        data={lang.s('anc')}
        extra={lang.s('anc_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={useAnc}
        on:toggle={onUseAnc}
    />
    {/if}
</RowList>
<script>
    import ToggleListTile from "../ToggleListTile.svelte"
    import {dynamicsCompressorEnable} from '../../../utils/player/process.js'

    const s = t => langMapping.s(t)

    let enable = dynamicsCompressorEnable()

    function changeEnable({detail}) {
        dynamicsCompressorEnable(enable = detail)
    }
</script>

<ToggleListTile
    clickable={false}
    bold={false}
    data={s('dynamic_compressor')}
    useAvatar={false}
    bind:checked={enable}
    on:toggle={changeEnable}
/>
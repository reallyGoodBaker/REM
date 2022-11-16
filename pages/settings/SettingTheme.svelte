<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import ToggleListTile from "../components/ToggleListTile.svelte"
    import {store} from '../../utils/stores/base.js'
    import { rem } from '../../utils/rem.js'

    const lang = s => langMapping.s(s)

    let {colors, selected, useAcrylic} = store.getSync('AppSettings/theme') || {
        colors: [2, 39, 148, 210, 270, 292, 322],
        selected: 3,
        useAcrylic: false
    }

    const saveTheme = () => store.set('AppSettings/theme', {
        colors, selected, useAcrylic
    })

    function onSelectedControlColor({detail}) {
        selected = detail;
        rem.emit('changeControlColor', colors[selected])
        saveTheme()
    }

    function onToggleUseAcrylic({detail}) {
        useAcrylic = detail
        rem.emit('useAcrylic', detail)
        saveTheme()
    }

</script>

<RowList title={lang('theme')}>
    <SelectListTile
        data={lang('theme_color')}
        bind:dataList={colors}
        bind:selected={selected}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectedControlColor}
    />
    <ToggleListTile
        data={lang('use_acrylic')}
        extra={lang('use_acrylic_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={useAcrylic}
        on:toggle={onToggleUseAcrylic}
    />
</RowList>
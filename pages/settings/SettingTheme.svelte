<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import {store} from '../../utils/stores/base.js'
    import { rem } from '../../utils/rem.js'

    const lang = s => langMapping.s(s)

    let {colors, selected, useAcrylic} = store.getSync('AppSettings/theme')

    const saveTheme = () => store.set('AppSettings/theme', {
        colors, selected, useAcrylic
    })

    function onSelectedControlColor({detail}) {
        selected = detail;
        rem.emit('changeControlColor', colors[selected])
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
</RowList>
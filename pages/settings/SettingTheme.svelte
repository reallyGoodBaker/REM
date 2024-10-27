<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import { store } from '../../utils/stores/base.js'
    import { rem } from '../../utils/rem.js'
    import { hue } from '../../utils/math.js'
    import { tick } from "svelte"

    const lang = s => langMapping.s(s)

    let { colors, selected, dark, selectedDark } = store.getSync('AppSettings/theme')

    const saveTheme = () => store.set('AppSettings/theme', {
        colors, selected, dark, selectedDark
    })

    async function onSelectedControlColor({ detail }) {
        if (!detail) {
            const sysTheme = await hooks.invoke('win:sys-colors')
            if (sysTheme) {
                rem.emit('changeControlColor', hue(sysTheme.accent))
                selected = detail
                saveTheme()
                return
            }

            await tick()
            return onSelectedControlColor({ detail: 1 })
        }

        selected = detail
        rem.emit('changeControlColor', colors[selected])
        saveTheme()
    }

    async function onSelectedDarkMode({ detail }) {
        if (!detail) {
            const sysTheme = await hooks.invoke('win:sys-colors')
            if (sysTheme) {
                rem.emit('changeDarkMode', sysTheme.dark)
                saveTheme()
                selectedDark = detail
                return
            }

            await tick()
            return onSelectedDarkMode({ detail: 1 })
        }

        selectedDark = detail
        rem.emit('changeDarkMode', dark[selectedDark].value)
        saveTheme()
    }

</script>

<RowList title={lang('theme')}>
    <SelectListTile
        data={lang('theme_color')}
        autoSelect={false}
        bind:dataList={colors}
        selected={selected}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectedControlColor}
    />
    <SelectListTile
        data={lang('theme_dark')}
        autoSelect={false}
        bind:dataList={dark}
        selected={selectedDark}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectedDarkMode}
    />
</RowList>
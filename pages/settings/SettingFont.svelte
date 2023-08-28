<script>
    import RowList from "../components/RowList.svelte"
    import ToggleListTile from "../components/ToggleListTile.svelte"
    import { store } from '../../utils/stores/base.js'
    import { setClearFont } from '../../utils/style/font.js'

    $: lang = window.langMapping

    let fontSettings = store.getSync('AppSettings/font')

    function onToggleClearFont({ detail }) {
        setClearFont(detail)
        store.set('AppSettings/font', fontSettings)
    }
</script>

<RowList title="{lang.s('font')}">
    <ToggleListTile
        data={lang.s('font_clear')}
        extra={lang.s('font_clear_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={fontSettings.clearFont}
        on:toggle={onToggleClearFont}
    />
</RowList>
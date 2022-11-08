<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"

    import {Lang} from '../../utils/lang/lang.js'

    $: lang = window.langMapping

    let {langs, selected} = store.getSync('AppSettings/lang') || {
        langs: [...Object.keys(Lang.langs)],
        selected: 'zh_cn'
    }

    function onSelected({detail}) {
        selected = langs[detail]
        rem.emit('langChange', selected)
        window.langMapping = new Lang(selected)
        store.set('AppSettings/lang', {langs, selected})
    }
</script>

<RowList title={lang.s('language')}>
    <SelectListTile
        data={lang.s('set_lang')}
        extra={lang.s('set_lang_extra')}
        dataList={langs}
        selected={langs.indexOf(selected)}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelected}
    />
</RowList>
<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import {store} from '../../utils/stores/base.js'
    import {Lang} from '../../utils/lang/lang.js'
    import { rem } from '../../utils/rem.js'

    $: lang = window.langMapping

    let {
        langs,
        selected
    } = store.getSync('AppSettings/lang')

    function onSelected({detail}) {
        selected = langs[detail]
        const l = window.langMapping = new Lang(selected)
        rem.emit('langChange', l)
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
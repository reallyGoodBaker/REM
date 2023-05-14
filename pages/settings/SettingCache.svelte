<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import ListTile from "../components/ListTile.svelte"
    import {store} from '../../utils/stores/base.js'
    
    $: lang = window.langMapping

    let {qualities, selected} = store.getSync('AppSettings/cache')

    function onSelectedControlColor({detail}) {
        selected = detail
        store.set('AppSettings/cache', {qualities, selected})
    }

    function clearCache() {
        store.clear()
    }

    function clearMusicCache() {

    }
</script>

<RowList title={lang.s('cache')}>
    <SelectListTile
        data={lang.s('cache_quality')}
        bind:dataList={qualities}
        bind:selected={selected}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectedControlColor}
    />
    <ListTile
        useAvatar={false}
        data={lang.s('clear_usr_data')}
        extra={lang.s('clear_usr_data_extra')}
        on:click={clearCache}
    />
    <ListTile
        useAvatar={false}
        data={lang.s('clear_cache')}
        on:click={clearMusicCache}
    />
    
</RowList>
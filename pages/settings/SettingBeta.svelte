<script>
    import { onMount } from "svelte";
    import RowList from "../components/RowList.svelte"
    import ToggleListTile from "../components/ToggleListTile.svelte"
    import {store} from '../../utils/stores/base.js'
    import { rem } from '../../utils/rem.js'

    $: lang = window.langMapping

    let betaFeatures = store.getSync('AppSettings/beta_features') || {
        showDevTools: false,
        extensions: false,
    }

    function onToggleDevTools({detail}) {
        const show = detail
            ? 'open'
            : 'close'

        hooks.send(`devtools:${show}`)
        betaFeatures.showDevTools = detail

        store.set('AppSettings/beta_features', betaFeatures)
    }

    function onToggleExtensions({detail}) {
        betaFeatures.extensions = detail
        store.set('AppSettings/beta_features', betaFeatures)

        rem.emit('showExtensionTab', detail)
    }

    onMount(() => {
        hooks.send(`devtools:${
            betaFeatures.showDevTools ? 'open': 'close'
        }`)
    })

</script>

{#if rem.isBeta}
<RowList title="{lang.s('test_features')}">
    <ToggleListTile
        data={lang.s('dev_tools')}
        extra={lang.s('dev_tools_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={betaFeatures.showDevTools}
        on:toggle={onToggleDevTools}
    />

    <ToggleListTile
        data={lang.s('extensions')}
        extra={lang.s('extensions_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={betaFeatures.extensions}
        on:toggle={onToggleExtensions}
    />
</RowList>
{/if}
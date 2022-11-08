<script>
    import { onMount } from "svelte";
    import RowList from "../components/RowList.svelte"
    import ToggleListTile from "../components/ToggleListTile.svelte"

    $: lang = window.langMapping

    let betaFeatures = store.getSync('AppSettings/beta_features') || {
        showDevTools: false
    }

    function onToggleDevTools({detail}) {
        const show = detail
            ? 'open'
            : 'close'

        hooks.send(`devtools:${show}`)
        betaFeatures.showDevTools = detail

        store.set('AppSettings/beta_features', betaFeatures)
    }

    onMount(() => {
        hooks.send(`devtools:${
            betaFeatures.showDevTools ? 'open': 'close'
        }`)
    })

</script>

{#if window.rem.isBeta}
<RowList title="{lang.s('test_features')}">
    <ToggleListTile
        data={lang.s('dev_tools')}
        extra={lang.s('dev_tools_extra')}
        useAvatar={false}
        isUrl={false}
        bind:checked={betaFeatures.showDevTools}
        on:toggle={onToggleDevTools}
    />
</RowList>
{/if}
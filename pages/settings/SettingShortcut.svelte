<script>
    import { writable } from "svelte/store"
    import { getShortcut, shortcutsProxy } from "../../utils/shortcut/browser/core"
    import KeyBindingDialog from "../../utils/shortcut/browser/KeyBindingDialog.svelte"
    import KeyBindingListTile from "../../utils/shortcut/browser/KeyBindingListTile.svelte"
    import RowList from "../components/RowList.svelte"
    import { tick } from "svelte"

    $: L = window.langMapping

    let shortcuts = writable(shortcutsProxy())
    let dialog

    async function handleEdit({ detail: { id, binding } }) {
        await dialog.openDialog(getShortcut(id))
        $shortcuts = shortcutsProxy()
        await tick()
        binding.render()
    }
</script>

<RowList title="{L.s('shortcuts')}">
    {#each $shortcuts as keyBinding}
    <KeyBindingListTile {keyBinding} on:edit={handleEdit} />
    {/each}
</RowList>
<KeyBindingDialog bind:this={dialog} />
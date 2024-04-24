<script>
    import Artist from "../Artist.svelte"
    import Link from "./Link.svelte"

    export let data = []
</script>

<style>
    .container {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 100%;
    }
</style>

<div class="container">
    {#each data as ar}
        <Link
            text={ar.name}
            cssText={'--color: #000; line-height: 1.2em;'}
            on:click={() => window.Pager.openNew(ar.name, Artist, { id: ar.id })}
        />
    {/each}
</div>
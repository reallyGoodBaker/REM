<script>
    import { setRoot } from "../utils/ext-market/browser";
    import ExtensionMarket from "./ExtensionMarket.svelte"

    export let root

    let canEdit = false

    function openExtensionMarket(root) {
        Pager.openNew('扩展市场', ExtensionMarket, { root })
    }
</script>

<style>
    .outer {
        position: relative;
        width: 400px;
        height: 200px;
        box-sizing: border-box;
        border: solid 1px transparent;
        border-radius: 10px;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        transition: scale 0.1s;
    }

    .outer:hover {
        background-color: var(--fadeBright);
    }

    .outer:active {
        scale: 0.98;
        border-color: var(--controlGray);
    }

    .shop-icon::after {
        content: '\e8c9';
        font-family: 'Material Symbols Round';
        font-size: 64px;
        color: var(--controlBlack24);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.1s;
    }

    .root-input {
        padding: 8px 10px;
        border-radius: 10px;
        font-size: small;
        position: absolute;
        bottom: 10px;
        background-color: var(--controlBrighter);
        color: var(--controlDarker);
    }
</style>

<div class="outer Row"
    on:mouseenter={() => canEdit = true}
    on:mouseleave={() => canEdit = false}
    on:click={() => openExtensionMarket(root)}>
        <div class="shop-icon"></div>
        {#if canEdit}
        <div class="root-input"
            contenteditable
            on:focus={() => canEdit = true}
            on:blur={() => canEdit = false}
            on:click|stopPropagation
            on:input={ev => setRoot(root = ev.target.innerText)}>{root}</div>
        {/if}
</div>
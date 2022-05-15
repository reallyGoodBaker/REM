<script>
import { getContext } from "svelte";

import ListTile from "./ListTile.svelte"

export let display = false
export let x = 0
export let y = 0
export let data = [{}]

const disableLayer = getContext('disableLayer')

</script>

<style>
.container {
    --x: 0;
    --y: 0;

    width: 200px;
    height: fit-content;

    font-size: small;
    background-color: #fff;
    box-shadow: 0px 2px 6px rgba(0,0,0,0.3);
    border-radius: 8px;
    overflow: hidden;
    display: none;
}

.container.display {
    display: block;
    position: absolute;
    top: var(--y, 0);
    left: var(--x, 0);

    animation: fadeIn 0.2s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.container > .divider:first-child {
    display: none;
}

.divider {
    width: 100%;
    border-bottom: solid 1px #ddd;
}

</style>

<div class="container {display? 'display': ''}"
    style="--x: {x}px; --y: {y}px"
    on:click={ev => ev.stopPropagation()}>
{#each data as context}
<div class="divider"></div>

{#each Object.keys(context) as k}
<ListTile
    useAvatar={false}
    size={'small'}
    isUrl={false}
    data={k}
    on:click={context[k]? () => {
        context[k].call(null)
        disableLayer()
    }: disableLayer}
/>
{/each}

{/each}
</div>
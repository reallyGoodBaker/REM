<script>
    import { writable } from "svelte/store"
    import { keyset2str } from "./core"

    export let key = ''
    export let flag = 0

    let display = writable(mappingStr())

    export function render() {
        display.set(mappingStr())
    }

    function mappingStr() {
        return keyset2str(key, flag)
    }
</script>

<div class="container">{$display}</div>

<style>
    .container {
        display: flex;
        align-items: center;
        background-color: var(--controlBright80);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        min-width: 200px;
        width: fit-content;
    }
</style>
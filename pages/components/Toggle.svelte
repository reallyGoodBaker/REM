<script>
    import { createEventDispatcher } from "svelte";


    export let checked = false;

    const emit = createEventDispatcher();

    function onToggle() {
        checked = !checked;
        emit('toggle', checked);
    }

    export function toggle() {
        onToggle();
    }

</script>

<style>
    .switch {
        position: relative;
        width: 40px;
        height: 20px;
        border-radius: 10px;
        background-color: var(--controlBackgroundAcrylic);
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .switch:active > .switchThumb {
        transform: translateX(-50%) scale(0.8);
    }

    .switchThumb {
        border-radius: 50%;
        background-color: var(--controlAcrylicDark);
        position: absolute;
        width: 12px;
        height: 12px;
        top: 4px;
        left: 10px;
        transform: translateX(-50%) scale(1);
        transition: left 0.2s, background-color 0.2s, transform 0.1s ease-in-out;
    }

    .thumb-active {
        left: calc(100% - 10px);
        background-color: var(--controlColor);
    }

    .active {
        background-color: var(--controlBright);
        /* border: solid 2px var(--controlColor); */
    }
</style>

<div class="switch{checked? ' active':''}" on:mousedown|stopPropagation on:click|stopPropagation={onToggle}>
    <div class="switchThumb{checked? ' thumb-active':''}"></div>
</div>
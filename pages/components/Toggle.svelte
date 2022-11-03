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
        width: 20px;
        height: 10px;
        border: solid 2px #aaa;
        border-radius: 7px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .switchThumb {
        border-radius: 50%;
        background-color: #eee;
        position: absolute;
        width: 20px;
        height: 20px;
        top: -5px;
        left: 0%;
        box-shadow: 0px 2px 2px rgba(0,0,0,0.4);
        transform: translateX(-50%);
        transition: left 0.2s, background-color 0.2s;
    }

    .thumb-active {
        left: 100%;
        background-color: var(--controlColor);
    }

    .active {
        border: solid 2px var(--controlColor);
    }
</style>

<div class="switch{checked? ' active':''}" on:mousedown|stopPropagation={()=>{}} on:click|stopPropagation={onToggle}>
    <div class="switchThumb{checked? ' thumb-active':''}"></div>
</div>
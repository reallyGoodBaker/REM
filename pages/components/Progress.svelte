<script>
    import { createEventDispatcher, onMount } from "svelte";

    export let value;
    export let cssStyle = '';

    let emit = createEventDispatcher();

    let startMove = false;
    let input;
    function mouseDown(ev) {
        startMove = true;
        let value = ev.offsetX/input.offsetWidth*100;
        input.value = value;
        emit('mousedown', value);
    }

    function mouseMove() {
        if(!startMove) return;
        emit('mousemove', input.value);
    }

    document.addEventListener('mouseup', () => {
        if (startMove) {
            startMove = false;
            emit('mouseup', input.value);
        }
    });

</script>


<style>
    input[type=range] {
        --progress: 50%;
        background-color: transparent;
        width: 100px;
        height: 10px;
        display: block;
        -webkit-appearance: none;
        border-radius: 10px;
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
    }
    
    input[type=range]::-webkit-slider-runnable-track {
        height: 2px;
        background: linear-gradient(90deg, var(--controlColor) var(--progress), #ddd var(--progress));
    }
    
    input[type=range]:focus {
        outline: none;
    }
    
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 10px;
        width: 10px;
        margin-top: -4px;
        background-color: #fff;
        border-radius: 50%;
        border: solid 2px transparent;
    }

    input[type=range]:hover::-webkit-slider-thumb {
        transform: scale(1.2);
        border: solid 2px var(--controlColor);
    }

    input[type=range]:active::-webkit-slider-thumb {
        transform: scale(1.2);
        border: solid 4px var(--controlColor);
        background-color: var(--controlColor);
    }

</style>


<input type="range"
    style="{cssStyle};--progress: {value}%"
    step="0.001"
    bind:value
    on:mousedown={mouseDown}
    on:mousemove={mouseMove}
    bind:this={input}
>
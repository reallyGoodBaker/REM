<script>
    import { createEventDispatcher, onMount } from "svelte";

    export let value;
    export let cssStyle = '';
    export let width = 100
    export let thumbWidth = 10

    let emit = createEventDispatcher();

    let startMove = false;
    let input;

    function mouseDown(ev) {
        startMove = true;
        let _value = ev.offsetX/input.offsetWidth*100;
        input.value = _value;
        value = _value
        emit('mousedown', _value);
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
        --thumb-width: 12px;
        --rail-width: 200px;
        --display-progress: 50%;
        background-color: transparent;
        width: var(--rail-width);
        height: 12px;
        display: block;
        -webkit-appearance: none;
        transform: scale(1);
        transition: transform 0.1s ease-in-out;
    }

    input[type=range]::-webkit-slider-runnable-track:active {
        background-color: var(--acrylicBackgroundColor);
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
    }
    
    input[type=range]::-webkit-slider-runnable-track {
        padding: calc(1px + 1px / var(--scale)) 2px;
        border-radius: 4px;
        height: 8px;
        background-color: var(--acrylicTransparent);
        transition: all 0.2s ease-in-out;
    }
    
    input[type=range]:focus {
        outline: none;
    }
    
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 3px;
        box-sizing: border-box;
        height: calc(6px - 2px / var(--scale));
        width: var(--thumb-width);
        background-color: var(--acrylicBackgroundColor);
        transition: all 0.1s;
    }

    input[type=range]:hover::-webkit-slider-thumb {
        background-color: var(--controlWhite);
    }

</style>


<input type="range"
    style="{cssStyle}; --progress: {value}%; --rail-width: {width}px; --thumb-width: {thumbWidth}px; --scale: {window.devicePixelRatio};"
    step="0.001"
    bind:value
    on:mousedown={mouseDown}
    on:mousemove={mouseMove}
    bind:this={input}
>
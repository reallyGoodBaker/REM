<script>
    import { createEventDispatcher, onMount } from "svelte";

    export let value;
    export let cssStyle = '';
    export let width = 100
    export let thumbWidth = 12

    $: dispalyWidth = ((width - thumbWidth) * value / (width * 100)) * width + thumbWidth / 2

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
        height: 10px;
        display: block;
        -webkit-appearance: none;
        border-radius: 10px;
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
    }
    
    input[type=range]::-webkit-slider-runnable-track {
        border-radius: 3px;
        height: 6px;
        background: linear-gradient(
            90deg,
            var(--controlBright) var(--display-progress),
            var(--acrylicBackgroundColor) var(--display-progress)
        );
    }
    
    input[type=range]:focus {
        outline: none;
    }
    
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 3px;
        box-sizing: border-box;
        height: 6px;
        width: var(--thumb-width);
        margin-top: 0px;
        background-color: var(--controlColor);
        transition: all 0.1s;
    }

    input[type=range]:hover::-webkit-slider-thumb {
        background-color: var(--controlDark);
    }

    input[type=range]:active::-webkit-slider-thumb {
        transform: scale(1.4);
    }

</style>


<input type="range"
    style="{cssStyle}; --progress: {value}%; --rail-width: {width}px; --thumb-width: {thumbWidth}px; --display-progress: {dispalyWidth}px;"
    step="0.001"
    bind:value
    on:mousedown={mouseDown}
    on:mousemove={mouseMove}
    bind:this={input}
>
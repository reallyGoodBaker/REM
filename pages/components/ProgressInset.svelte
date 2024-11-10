<script>
    import { createEventDispatcher, onMount } from "svelte"

    export let value
    export let cssStyle = ''
    export let width = 100
    export let thumbWidth = 12

    let emit = createEventDispatcher()

    let startMove = false
    let input

    function mouseDown(ev) {
        startMove = true
        let _value = ev.offsetX/input.offsetWidth*100
        input.value = _value
        value = _value
        emit('mousedown', _value)
    }

    function mouseMove() {
        if(!startMove) return
        emit('mousemove', input.value)
    }

    document.addEventListener('mouseup', () => {
        if (startMove) {
            startMove = false
            emit('mouseup', input.value)
        }
    })

</script>


<style>
    input[type=range] {
        --progress: 50%;
        --thumb-width: 12px;
        --rail-width: 200px;
        --display-progress: 50%;
        background-color: transparent;
        width: var(--rail-width);
        height: 14px;
        display: block;
        appearance: none;
        transform: scale(1);
        transition: transform 0.1s ease-in-out;
    }

    input[type=range]::-webkit-slider-runnable-track:active {
        background-color: var(--acrylicBackgroundColor);
    }
    
    input[type=range]::-webkit-slider-runnable-track {
        padding: 0 2px;
        border-radius: 5px;
        height: calc(7px + calc(4px / var(--scale)));
        background-color: rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease-in-out;
        opacity: 0.8;
    }
    
    input[type=range]:focus {
        outline: none;
    }
    
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        margin: calc(2px / var(--scale)) 0;
        border-radius: 4px;
        box-sizing: border-box;
        height: 7px;
        width: var(--thumb-width);
        background-color: var(--controlGray);
        opacity: 0.8;
        transition: all 0.1s;
    }

    input[type=range]:hover::-webkit-slider-thumb {
        background-color: #fff;
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
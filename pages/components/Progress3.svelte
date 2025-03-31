<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte"

    export let value = 0
    export let cssStyle = ''
    export let width = 100
    export let thumbHeight = 18
    export let height = 12

    let emit = createEventDispatcher()
    let startMove = false
    let input

    let dx

    function mouseDown(ev) {
        startMove = true
        let _value = ev.offsetX / input.offsetWidth * 100
        value = _value
        dx = ev.offsetX
        emit('mousedown', _value)
    }

    function mouseMove(ev) {
        ev.stopPropagation()
        if(!startMove) return
        dx += ev.movementX
        let _value = Math.min(100, Math.max(0, dx / input.offsetWidth * 100))
        value = _value
        emit('mousemove', value)
    }

    function mouseUp() {
        if (startMove) {
            startMove = false
            dx = 0
            emit('mouseup', value)
        }
    }

    onMount(() => {
        document.addEventListener('mouseup', mouseUp)
        document.addEventListener('mousemove', mouseMove, { passive: true, capture: true })
    })

    onDestroy(() => {
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', mouseUp)
    })

    $: progressRaw = value / 100
    let scale = (width - 4) / width

</script>

<style>
    .container {
        --width: 100;
        width: calc(1px * var(--width));
        --thumbHeight: 18;
        position: relative;
        contain: paint;
        height: calc(var(--thumbHeight) * 1px);
    }

    .track {
        --progress: 0;
        --height: 12;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc(100% - 2px);
        height: calc(var(--height) * 1px);
        border-radius: 12px;
        overflow: hidden;
    }

    .container > *, .track > * {
        pointer-events: none;
    }

    .thumb-box {
        width: 100%;
        height: calc(var(--height) * 1px);
        position: relative;
        display: flex;
        gap: 7px;
    }

    .thumb-box::before {
        content: '';
        position: relative;
        box-sizing: border-box;
        left: 0;
        width: calc(var(--progress) * var(--width) * 1px - 3px);
        height: 100%;
        border-radius: 12px 6px 6px 12px;
        background-color: var(--controlColor);
    }

    .thumb-box::after {
        content: '';
        box-sizing: border-box;
        position: relative;
        right: 0;
        width: calc((1 - var(--progress)) * var(--width) * 1px - 3px);
        height: 100%;
        border-radius: 6px 12px 12px 6px;
        background-color: var(--controlBright);
    }

    .divider {
        position: absolute;
        box-sizing: border-box;
        top: 50%;
        left: calc(var(--progress) * var(--scale) * 100% + 2px);
        transform: translate(-50%, -50%);
        display: flex;
        width: 1px;
        border: solid 1px var(--controlBlack);
        height: calc(var(--thumbHeight) * 1px);
        pointer-events: none;
    }
</style>

<div
    bind:this={input}
    class="container"
    style="--width: {width}; --thumbHeight: {thumbHeight}; --scale: {scale}; {cssStyle}"
    on:mousedown={mouseDown}
    on:mousemove={mouseMove}
>
    <div class="track" style="--height: {height}; --progress: {progressRaw};">
        <div class="thumb-box" />
    </div>

    <div class="divider" style="--progress: {progressRaw};" />
</div>
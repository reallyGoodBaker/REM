<script>
    import { onDestroy, onMount } from "svelte";
    import { setEq, getEq } from '../../../utils/player/process.js'

    export let f = 31
    export let label = f
    export let enable = true

    let height = 0
        ,trackHeight = 0
        ,track

    function moveUp() {
        renderValue(+input.innerText + 0.5)
        onValueChange()
    }

    function moveDown() {
        renderValue(input.innerText - 0.5)
        onValueChange()
    }

    function onValueChange() {
        const val = +input.innerText

        setEq(f, val)
        if (rem) {
            rem.emit('eqChange')
        }

        height = (val + 20) / 40 * trackHeight
    }

    let dragging = false

    function startDrag() {
        dragging = true
    }

    function onMouseUp() {
        if (dragging) {
            dragging = false
        }
    }

    function onMouseMove(ev) {
        if (!dragging) {
            return
        }

        height = Math.max(0, Math.min(height - (ev.movementY / window.devicePixelRatio), trackHeight))
        renderValue(height / trackHeight * 40 - 20)
    }

    onMount(() => {
        trackHeight = track.getBoundingClientRect().height
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mousemove', onMouseMove)
        input.addEventListener('keydown', onEnter)

        renderValue(getEq(f))
        onValueChange()
    })

    onDestroy(() => {
        document.removeEventListener('mouseup', onMouseUp)
        document.removeEventListener('mousemove', onMouseMove)
        input.removeEventListener('keydown', onEnter)
    })

    function onEnter(ev) {
        if (ev.key === 'Enter') {
            if (document.activeElement === input) {
                ev.preventDefault()
                onChange(input.innerText.replace(/\n/g, ''))
                input.blur()
            }
        }
    }

    let input
    function onChange(val) {
        val = +val
        val = isNaN(val)? 0: val
        renderValue(Math.max(-20, Math.min(val, 20)))
        onValueChange()
    }

    function renderValue(val) {
        input.innerText = (+val).toFixed(1)
    }

    function onBlur() {
        onChange(input.innerText)
    }
</script>

<style>
    .outer {
        width: 10%;
        min-width: 40px;
        height: 360px;
    }

    .track {
        margin: 16px 0;
        border-radius: 2px;
        width: 4px;
        height: 260px;
        flex-direction: column-reverse;
        background-color: var(--controlGray);
        cursor: pointer;
    }

    .progress {
        position: relative;
        width: 100%;
        height: var(--height, 0);
        border-radius: 2px;
        flex-direction: column;
        background-color: var(--controlColor);
        transition: height 0.1s ease-in-out;
    }

    .progress.drag {
        transition: height 0s;
    }

    .disable {
        pointer-events: none;
    }

    .disable > .progress{
        background-color: var(--controlBlack52);
    }

    .thumb {
        position: absolute;
        top: 0;
        left: 50%;
        width: 20px;
        height: 32px;
        background-color: var(--controlWhite);
        border-radius: 10px;
        transform: translate(-50%, -50%) scale(1);
        box-sizing: border-box;
        border: solid 3px var(--controlGray);
        cursor: pointer;
        transition: border-color 0.5s, transform 0.1s ease-in-out;
    }

    .thumb::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 2px;
        width: 10px;
        border-radius: 2px;
        background-color: var(--controlGray);
        transition: background-color 0.5s;
    }

    .thumb:hover::after {
        background-color: var(--controlColor);
    }

    .thumb:hover {
        border-color: var(--controlColor);
    }

    .thumb:active {
        transform: translate(-50%, -50%) scale(1.2);
    }

    .txt {
        color: var(--controlDarker);
        border-radius: 4px;
        border: solid 2px transparent;
        padding: 2px;
        font-size: small;
        transform: scale(0.84);
        transition: transform 0.1s ease-in-out;
    }

    .txt.disable {
        color: var(--controlGray);
    }

    .bigger {
        transform: scale(1);
    }

    .label {
        color: var(--controlBlack);
        font-size: small;
        margin: 4px 0 2px;
    }

    .txt:focus {
        outline: none;
        transform: scale(1);
        border-color: var(--controlColor);
    }
</style>

<div class="Column outer">
    <div class="Column track {enable? '': 'disable'}" on:click|stopPropagation={moveUp} bind:this={track}>
        <div class="progress {dragging? 'drag': ''}" on:click|stopPropagation={moveDown} style="--height: {height}px">
            <div class="thumb" on:mousedown|stopPropagation={startDrag}></div>
        </div>
    </div>
    <div class="label">{label}</div>
    <div on:blur={onBlur} bind:this={input} contenteditable class="txt {dragging? 'bigger': ''} {enable? '': 'disable'}"></div>
</div>
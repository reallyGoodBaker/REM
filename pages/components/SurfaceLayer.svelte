<script>
import { setContext } from "svelte";

let fade = false

export function activeLayer() {
    fade = true
}

export function disableLayer() {
    fade = false
    display = false
}

import ContextMenu from "./ContextMenu.svelte";

let display,
    cmX,
    cmY,
    cmData

function showContextMenu(x, y, path) {
    cmX = visualViewport.width - x > 200
        ? x
        : x - 200

    cmY = y

    let _cmData = []
    for (const k of contextMap.keys()) {
        if (path.includes(k)) {
            _cmData.push(contextMap.get(k))
        }
    }

    if (_cmData.length) {
        activeLayer()
        cmData = _cmData
        display = true
    }
}

window.addEventListener('mousedown', ev => {
    if (ev.button === 2) {
        const {pageX, pageY, path} = ev

        if (display) {
            disableLayer()
            return requestIdleCallback(() => showContextMenu(pageX, pageY, path))
        }

        ev.preventDefault()
        showContextMenu(pageX, pageY, path)
    }
})

setContext('disableLayer', disableLayer)
</script>

<style>
    .container {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100vw;
        height: 100vh;
        transform: translate(0, 0);
        background-color: transparent;
        pointer-events: none;
        transition: background-color 0.2s;
    }

    .container.fade {
        -webkit-app-region: no-drag;
        pointer-events: all;
        /* background-color: rgba(0, 0, 0, 0.3); */
    }
</style>

<div class="container {fade? 'fade': ''}" on:click={disableLayer}>
    <ContextMenu
        bind:display
        bind:x={cmX}
        bind:y={cmY}
        bind:data={cmData}
    />
    <slot></slot>
</div>
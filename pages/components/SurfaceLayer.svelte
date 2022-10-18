<script>
    import { onMount, setContext } from "svelte";
    import { EventEmitter } from "../../utils/events.js";
    import Popup from './Popup.svelte'

    let layer = false;

    const layerEvents = new EventEmitter();

    export function activeLayer() {
        layer = true;
    }

    export function disableLayer() {
        layer = false;
        cmDisplay = false;
    }

    layerEvents.on("active", activeLayer);
    layerEvents.on("disable", disableLayer);

    import ContextMenu from "./ContextMenu.svelte";
    import VirtualCursor from "./VirtualCursor.svelte";

    let cmDisplay, cmX, cmY, cmData;

    function showContextMenu(x, y, path) {
        cmX = visualViewport.width - x > 200 ? x : x - 200;

        cmY = y;

        let _cmData = [];
        for (const k of contextMap.keys()) {
            if (path.includes(k)) {
                _cmData.push(contextMap.get(k));
            }
        }

        if (_cmData.length) {
            activeLayer();
            cmData = _cmData;
            cmDisplay = true;
        }
    }

    window.addEventListener("mousedown", (ev) => {
        if (ev.button === 2) {
            const { pageX, pageY, path } = ev;

            if (cmDisplay) {
                layerEvents.emit("disable");
                return requestIdleCallback(() =>
                    showContextMenu(pageX, pageY, path)
                );
            }

            ev.preventDefault();
            showContextMenu(pageX, pageY, path);
        }
    });

    setContext("layerEvents", layerEvents);

    import { connectNotif } from '../../utils/controller-support/base/index.js'
    import { xboxControllerMouseSupporter } from "../../utils/controller-support/xbox/controllerSupport.js";
    import { init } from "../../utils/wizard/edit-profile/index.js";
    import { WillCreateLayerWidget } from '../../utils/widget/layer.js'

    let layerElement;

    let virtCursor,
        vcEnable,
        vcActive,
        virtProxy = new Proxy(
            {
                click: false,
                scroll: 0,
                x: visualViewport.width / 2,
                y: visualViewport.height / 2,
                enable: vcEnable,
            },
            {
                get(t, p) {
                    return t[p];
                },

                set(t, p, v) {
                    switch (p) {
                        case "click":
                            vcActive = v;
                            t[p] = v;
                            break;
                        case "enable":
                            vcEnable = v;
                            t[p] = v;
                            break;
                        case "x":
                            virtCursor.style.left = v + "px";
                            t[p] = v;
                            break;
                        case "y":
                            virtCursor.style.top = v + "px";
                            t[p] = v;
                            break;
                    }
                    return true;
                },
            }
        );

    onMount(() => {
        xboxControllerMouseSupporter.init(virtProxy)
        WillCreateLayerWidget.injectLayer(layerElement)
        init(layerElement)
    });

    import { networkChangeNotif } from "../../utils/network/browser.js"
    onMount(() => {
        networkChangeNotif.inject(layerElement)
        connectNotif.inject(layerElement)
    })

    import TunnerWindow from './TunnerWindow.svelte'
    let showTunnerWindow = false
    rem.on('tunnerOpen', () => showTunnerWindow = true)
    rem.on('tunnerClose', () => showTunnerWindow = false)
</script>

<div
    class="container {layer ? 'layer' : ''}"
    on:click={() => layerEvents.emit("disable")}
    bind:this={layerElement}
>
    <ContextMenu
        bind:display={cmDisplay}
        bind:x={cmX}
        bind:y={cmY}
        bind:data={cmData}
    />
    <VirtualCursor
        bind:enable={vcEnable}
        bind:active={vcActive}
        bind:htmlElement={virtCursor}
    />
    <Popup
        bind:showPopupWindow={showTunnerWindow}
        shadowBlurRadius={24}
        noLayer={false}>
        <TunnerWindow/>
    </Popup>
    <slot />
</div>

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
        z-index: 4;
    }

    .container.layer {
        -webkit-app-region: no-drag;
        pointer-events: all;
    }
</style>

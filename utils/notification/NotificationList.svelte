<script>
    import { onDestroy, onMount } from "svelte"
    import Notification from "./Notification.svelte"
    import { rem } from "../rem.js"
    import { globalNotifications } from "./browser"

    let container

    function addNotification(notification) {
        /**@type {Notification}*/
        const oldNotif = globalNotifications[notification.channel]

        if (oldNotif) {
            oldNotif.close()
        }

        globalNotifications[notification.channel] = notification.dom
            ? (container.appendChild(notification.dom), notification.dom)
            : new Notification({ target: container, props: notification })
    }

    onMount(() => {
        rem.on("notification:send", addNotification)
    })

    onDestroy(() => {
        rem.off("notification:send", addNotification)
    })
</script>

<style>
    .outer {
        position: absolute;
        right: 0;
        top: 54px;
        height: calc(100vh - 126px);
        width: 400px;
        pointer-events: none;
        flex-direction: column-reverse;
        flex-wrap: nowrap;
        flex: none;
        z-index: 1;
    }
</style>


<div class="Column outer" bind:this={container}></div>
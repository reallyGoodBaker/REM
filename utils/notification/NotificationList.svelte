<script>
    import { onDestroy, onMount } from "svelte"
    import Notification from "./Notification.svelte"
    import { rem } from "../rem.js"

    let notifications = {}
    let container

    function addNotification(notification) {
        /**@type {Notification}*/
        const oldNotif = notifications[notification.channel]

        if (oldNotif) {
            oldNotif.close()
        }

        const notif = new Notification({ target: container, props: notification })
        notifications[notification.channel] = notif
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
    }
</style>


<div class="Column outer" bind:this={container}></div>
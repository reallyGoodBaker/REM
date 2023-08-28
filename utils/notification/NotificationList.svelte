<script>
    import { onDestroy, onMount } from "svelte"
    import Notification from "./Notification.svelte"
    import { rem } from "../rem.js"

    let notifications = {}

    function addNotification(notification) {
        notifications[notification.channel] = notification
        notifications = notifications
    }

    $: values = Object.values(notifications)

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


<div class="Column outer">
    {#each values as notif}
        <Notification {...notif} />
    {/each}
</div>

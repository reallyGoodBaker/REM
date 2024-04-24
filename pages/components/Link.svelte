<script>
    import { createEventDispatcher } from "svelte"

    const emit = createEventDispatcher()

    export let text = ''
    export let cssText = ''

    function onClick() {
        emit("click")
    }
</script>

<style>
    .link {
        --color: '#ddd';
        color: var(--color);
        font-size: small;
        border-bottom: solid 2px transparent;
        margin: 2px 0;
        user-select: none;
        cursor: pointer;
    }

    .link:hover {
        text-decoration: underline;
    }

    .link:active {
        opacity: 0.72;
    }
</style>

<span class="link" style="{cssText}" on:click={onClick}>{text}</span>
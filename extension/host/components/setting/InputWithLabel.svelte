<script>
    import { createEventDispatcher } from "svelte"
    import Input from "../../../../pages/components/Input.svelte"

    const emit = createEventDispatcher()

    export let value = ''
    export let label = ''
</script>

<style>
    .container {
        height: 32px;
        justify-content: space-between;
        width: 100%;
    }
</style>

<div class="Row container">
    <div>{label}</div>
    <Input
        bind:value
        {...$$props}
        on:blur={ev => emit('blur', ev.detail)}
        on:change={ev => emit('change', ev.detail)}
        on:focus={ev => emit('focus', ev.detail)}
        on:input={ev => emit('input', ev.detail)}/>
</div>
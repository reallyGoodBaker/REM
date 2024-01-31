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
        on:blur={() => emit('blur', value)}
        on:change={() => emit('change', value)}
        on:focus={() => emit('focus', value)}
        on:input={() => emit('input', value)}/>
</div>
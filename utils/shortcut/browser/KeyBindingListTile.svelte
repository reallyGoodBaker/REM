<script>
    import { createEventDispatcher } from "svelte"
    import ListTile from "../../../pages/components/ListTile.svelte"
    import RippleLayer from "../../../pages/components/RippleLayer.svelte"
    import KeyBinding from "./KeyBinding.svelte"

    const emit = createEventDispatcher()
    let binding
    $: L = langMapping.s

    export let keyBinding = {}
</script>

<style>
    .icon-btn {
        width: 36px;
        height: 36px;
        font-size: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<ListTile clickable={false} useAvatar={false} data={L(keyBinding.id)}>
    <div class="Row start" style="gap: 16px;">
        <KeyBinding bind:this={binding} flag={keyBinding.flag} key={keyBinding.key}/>
        <RippleLayer useHoverLayer={true} rippleColor='var(--fadeDark)' cssStyle="border-radius: 50%;">
            <div class='new-icon icon-btn' on:click={() => emit('edit', {
                id: keyBinding.id,
                binding
            })}>{'\ue3c9'}</div>
        </RippleLayer>
        <div style="width: 160px;"></div>
        <div class="new-icon" style="font-size: 20px;">{'\ue312'}</div>
    </div>
</ListTile>
<script>
    import { createEventDispatcher } from "svelte";
    const emit = createEventDispatcher();

    function handleClick(ev) {
        emit('click', ev);
    }

    function handleOnLoaded() {
        emit('loaded');
    }

    export let isUrl = true;
    export let avatar = '';
    export let size = '';
    export let width;
    export let height;
    export let radius = "50%";
    export let clickable = true;
    export let ctx = this;
    export let cssText = '';
</script>

<style>
    .avatar {
        text-align: center;
    }

    .clkable {
        cursor: pointer;
    }

    .size-small {
        width: 20px;
        height: 20px;
        font-size: 16px;
        line-height: 20px;
    }

    .size-normal {
        width: 28px;
        height: 28px;
        font-size: 24px;
        line-height: 28px;
    }

    .size-big {
        width: 36px;
        height: 36px;
        font-size: 32px;
        line-height: 36px;
    }
</style>

<div class="column{clickable?' clkable':''}" on:click={handleClick} style="width: fit-content; heigth: fit-content;{cssText}">
{#if isUrl}
    <img on:load={handleOnLoaded} bind:this={ctx} src={avatar} class="avatar" alt="avatar size-{size? size: 'normal'}" draggable="false" {width} {height} style="border-radius: {radius};{cssText}">
{:else}
    <span class="avatar iconfont size-{size? size: 'normal'}" style="border-radius: {radius};{cssText}">{avatar}</span>
{/if}
</div>
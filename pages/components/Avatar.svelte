<script>
    import { createEventDispatcher } from "svelte";
    import { getImgSrc } from '../../utils/stores/img.js'
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

<div class="column{clickable?' clkable':''}" on:click={handleClick} style="width: fit-content; heigth: fit-content; overflow: hidden; border-radius: {radius};{cssText}">
{#if isUrl}
    {#await getImgSrc(avatar)}
        <div
            class="avatar"
            style="background-color: var(--controlGray); width: {width}px; height: {height}px"
        ></div>
    {:then url} 
    <img on:load={handleOnLoaded}
        bind:this={ctx}
        src={url}
        class="avatar"
        alt="avatar"
        draggable="false" 
        {width} {height}>
    {/await}
{:else}
    <span class="avatar iconfont size-{size? size: 'normal'}">{avatar}</span>
{/if}
</div>
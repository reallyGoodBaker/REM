<script>
    import Avatar from './Avatar.svelte';
    import {createEventDispatcher} from 'svelte';
    import RippleLayer from './RippleLayer.svelte';

    const emit = createEventDispatcher();

    function handleClick(ev) {
        emit('click', ev);
    }

    function handleMouseDown(ev) {
        emit('mousedown', ev);
    }


    export let isUrl = true;
    export let size = 'normal';
    export let avatar = '';
    export let data = '';
    export let extra = '';
    export let style = '';
    export let width;
    export let height;
    export let clickable = true;
    export let useAvatar = true;
    export let breakLine = false;
    export let padding = 8;
    export let bold = false;
</script>


<style>

    .c {
        --padding: 8px;
        box-sizing: border-box;
        padding: 8px var(--padding);
        width: 100%;
        justify-content: flex-start;
        overflow: hidden;
    }

    .cl {
        transition: all 0.12s;
        cursor: pointer;
    }

    .cl:hover {
        background-color: rgba(0,0,0,0.1);
    }

    .leading {
        width: 56px;
    }

    .align {
        align-items: flex-start;
    }

    .extra {
        opacity: 0.9;
        font-size: small;
        color: var(--controlBlack36);
    }

    .data {
        color: var(--controlBlack);
    }

    .bold {
        font-weight: bold;
    }
</style>

<RippleLayer cssStyle="width: 100%" rippleColor={clickable?"gray":"transparent"}>
<div style="--padding: {padding}px;" class="column c{clickable? ' cl': ''}" on:click={handleClick} on:mousedown={handleMouseDown}>
    {#if useAvatar}
    <div class="column leading">
        <Avatar
            {size}
            {isUrl}
            {avatar}
            {width}
            {height}
        ></Avatar>
    </div>
    {:else}
    <div style="width: 14px"></div>
    {/if}


    {#if breakLine}

    <div class="row align" style="width: {useAvatar? 'calc(100% - 84px)': 'calc(100% - 28px)'};{style}">
        {#if extra}
            <span class="data {bold ? 'bold' : ''}">{data}</span>
            <span class="extra">{extra}</span>
        {:else}
            <span class="data {bold ? 'bold' : ''}">{data}</span>
        {/if}
        <slot/>
    </div>

    {:else}

    <div class="column" style="justify-content: space-between; width: {useAvatar? 'calc(100% - 84px)': 'calc(100% - 28px)'}">
        <div class="row align" {style}>
            {#if extra}
                <span class="data {bold ? 'bold' : ''}">{data}</span>
                <span class="extra">{extra}</span>
            {:else}
                <span class="data {bold ? 'bold' : ''}">{data}</span>
            {/if}
        </div>
        <slot/>
    </div>

    {/if}
</div>
</RippleLayer>
<script>
    import { afterUpdate, onMount } from 'svelte';

    import { rem } from '../../utils/rem.js'

    const s = (f, ...args) => {
        if (f.startsWith('#')) {
            f = f.slice(1)
        }

        if (f.startsWith('$')) {
            return langMapping.s(f.slice(1), ...args)
        }

        return f
    }

    export let tabs = [
        '#$mine',
        '#$explorer'
    ]

    $: oneThirdVw = visualViewport.width/3

    let overflowed = false
        ,inner
        ,outer

    afterUpdate(() => {
        overflowed = inner.getBoundingClientRect().width > outer.getBoundingClientRect().width

        requestAnimationFrame(() => {
            let selectedElement = document.getElementById('nav_selected')
            if (selectedElement) {
                const fix = (selectedElement.getBoundingClientRect().left - visualViewport.width/2 + 100)
                scroll(fix)
            }
        })
    })

    onMount(() => {
        outer.addEventListener('wheel', ev  => {
            const scrollOffset = ev.deltaY
            scroll(scrollOffset, false)
        })
    })

    function scroll(dx, useSmooth=true) {
        let offsetX = outer.scrollLeft + (+dx || 0)
        outer.scrollTo({
            left: offsetX,
            behavior: useSmooth? 'smooth': 'instant'
        })
    }

    function fresh() {
        requestAnimationFrame(() => {
            const _tabs = tabs.slice()
            tabs = _tabs
        })
    }


    rem.on('langChange', fresh)

    export let selected = 0;

    function onClick(i) {
        Pager.select(i);
    }

    function delTab(index=selected) {
        Pager.remove(index);
    }

</script>


<style>
    .stretch {
        width: calc(100vw - 24px);
        height: fit-content;
        overflow: hidden;
        border-radius: 6px;
    }

    .btn {
        font-size: normal;
        justify-content: center;
        border-radius: 4px;
        padding: 0;
        position: absolute;
        top: 2px;
        width: 16px;
        height: calc(100% - 4px);
        opacity: 0;
        z-index: 1;
        box-shadow: 0 0 8px var(--controlWhite);
    }

    .btn.left {
        left: 2px;
    }

    .btn.right {
        right: 2px;
    }

    .overflowed {
        background-color: var(--controlWhite);
        box-shadow: 0 1px 4px var(--fade);
    }

    .overflowed:hover > .btn {
        opacity: 1;
    }

    .c {
        padding: 0 24px;
        width: fit-content;
        height: 34px;
        border-bottom: solid 1px transparent;
        flex-wrap: nowrap;
        gap: 4px;
    }

    .tab {
        display: flex;
        /* justify-content: center; */
        align-items: center;
        height: 22px;
        border-radius: 17px;
        position: relative;
        font-size: small;
        border: solid 2px transparent;
        max-width: 160px;
        min-width: 28px;
        padding: 0px 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tab:hover {
        background-color: var(--controlGrayAcrylic);
    }

    .tab > .cross {
        opacity: 0;
    }

    .tab:hover > .cross, .selected > .cross {
        opacity: 1;
    }

    .tab-text {
        color: var(--controlBlack);
        overflow: hidden;
        word-break: keep-all;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 160px;
    }

    .selected {
        padding: 0px 8px;
        color: var(--controlNight);
        animation: sel forwards 0.12s;
    }

    .selected > .tab-text {
        color: var(--controlNight);
    }

    @keyframes sel {
        from {
            border-radius: 17px;
        }

        to {
            font-weight: bold;
            border-radius: 17px;
            background-color: var(--controlBrighter);
        }
    }

    .cross {
        font-family: 'Material Symbols Round';
        opacity: 1;
        font-size: 10px;
        line-height: 10px;
        width: 18px;
        height: 18px;
        margin-left: 4px;
        color: var(--controlDark);
        border-radius: 50%;
        justify-content: center;
        align-items: center;
        transition: all 0.12s;
    }

    .cross:hover {
        background-color: rgba(0,0,0,0.16);
    }

    .cross:active {
        background-color: rgba(0,0,0,0.4);
    }

    .cross.closeable {
        position: absolute;
        right: 2px;
        background-color: var(--controlBackground);
    }

    .cross.closeable:hover {
        background-color: var(--controlBright);
    }

    .cross.closeable:active {
        background-color: var(--controlBlack52);
    }

</style>

<div class="Column stretch {overflowed? 'overflowed': ''}">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="btn new-icon light left Column"
        on:click={() => scroll(-oneThirdVw)}
        >{'\ue5de'}</div>

    <div class="Column stretch" bind:this={outer}>
        <div class="Row c" bind:this={inner}>
            {#each tabs as tab, i}
                {#if i === selected}
                 <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if tab.startsWith('#')}
                        <div id="nav_selected" class="tab selected tab-text" on:pointerdown={() => onClick(i)}>{s(tab)}</div>
                    {:else}
                        <div id="nav_selected" class="tab selected column" style="padding-right: 2px;" on:pointerdown={() => onClick(i)}>
                            <span class="tab-text">{s(tab)}</span>
                            <div class="column cross" on:pointerdown|nonpassive={() => delTab()}>{'\ue5cd'}</div>
                        </div>
                    {/if}
                {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="tab tab-text Row" on:pointerdown={() => onClick(i)}>
                        <span>{s(tab)}</span>
                        {#if !tab.startsWith('#')}
                            <div class="Row cross closeable" on:pointerdown={() => delTab(i)}>{'\ue5cd'}</div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </div>

     <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="btn new-icon light right Column"
        on:click={() => scroll(oneThirdVw)}
        >{'\ue5df'}</div>
</div>
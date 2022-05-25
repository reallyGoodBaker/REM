<script>

    export let tabs = [
        '我的',
        '发现'
    ];

    export let selected = 0;

    function onClick(i) {
        Pager.select(i);
    }

    function delTab() {
        Pager.remove(selected);
    }

</script>


<style>
    .c {
        width: 100%;
        height: 34px;
        overflow: hidden;
        border-bottom: solid 1px transparent;
    }

    .tab {
        font-size: small;
        border: solid 3px transparent;
        max-width: 160px;
        padding: 2px 0px;
        margin: 2px;
        cursor: pointer;
        transition: all 0.2s;
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
        animation: sel forwards 0.12s;
    }

    @keyframes sel {
        from {
            border-radius: 17px;
        }

        to {
            font-weight: bold;
            border-radius: 17px;
            color: var(--controlDarker);
            background-color: var(--controlBrighter);
        }
    }

    .cross {
        font-size: 14px;
        width: 18px;
        height: 18px;
        margin-left: 4px;
        color: var(--controlDark);
        border-radius: 50%;
        transition: all 0.12s;
    }

    .cross:hover {
        background-color: rgba(0,0,0,0.16);
    }

    .cross:active {
        background-color: rgba(0,0,0,0.4);
    }

    /* .fold {
        border-bottom: solid 1px rgba(0,0,0,0.2);
    } */
</style>

<div class="column c">
    {#each tabs as tab, i}
        {#if i === selected}
            {#if tab === '我的' || tab === '发现'}
                <div class="tab selected tab-text" on:click={() => onClick(i)}>{tab}</div>
            {:else}
                <div class="tab selected column" style="padding-right: 2px;" on:click={() => onClick(i)}>
                    <span class="tab-text">{tab}</span>
                    <div class="column cross" on:click={delTab}>⨯</div>
                </div>
            {/if}
        {:else}
            <div class="tab tab-text" on:click={() => onClick(i)}>{tab}</div>
        {/if}
    {/each}
</div>
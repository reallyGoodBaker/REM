<script>
    import { onMount } from "svelte";


    export let icon = '\ue61b'
    export let title = ''
    export let hideLine = false

    let line, content;

    onMount(() => {
        line.style.height = content.getBoundingClientRect().height + 16 + 'px'
    })
</script>


<style>
    .hide {
        visibility: hidden;
    }
    .avatar {
        font-family: iconfont;
        margin: 8px;
    }
    h4 {
        margin: 0;
        margin-left: 8px;
    }
    .Row.start {
        width: 100%;
        justify-content: flex-start;
    }
    .Column.start {
        width: 100%;
        justify-content: flex-start;
    }
    .content {
        height: fit-content;
        font-size: small;
        min-height: 12px;
        margin-left: 8px;
        margin-bottom: 16px;
        color: var(--controlBlack36);
        width: calc(100% - 62px);
    }
</style>


<div class="Column start" style="height: fit-content;">
    <div class="Row start">
        <div class="avatar">
            {icon}
        </div>

        <h4>{title}</h4>
    </div>
    <div class="Row start" style="height: fit-content;">
        <div bind:this={line} class="{hideLine? 'hide ': ''}Column" style="width: 32px; color: var(--controlNight);">
            <div style="background-color: var(--controlNight); width: 2px; height: calc(100% - 16px);"></div>
            <div style="text-align: center; height: 16px; transform: translateY(-8px) scaleX(0.6);">▼</div>
        </div>
        <div bind:this={content} class="content">
            <slot/>
        </div>
    </div>
</div>
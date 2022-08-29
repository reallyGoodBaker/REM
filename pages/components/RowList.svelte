<script>
    export let marginHorizon = '10px';
    export let marginVertical = '6px';
    export let radius = '8px';
    export let color = 'rgba(255,255,255,0.4)';
    export let title = '';
</script>

<style>
    .container {
        margin-top: 8px;
        width: 100%;
    }

    .tile {
        height: fit-content;
        border: solid 1px var(--controlGray);
        overflow: hidden;
        box-sizing: border-box;
    }
</style>

<div class="container">
    {#if title}
    <div style="color: var(--controlDark); font-weight: bold; margin-bottom: 12px; margin-left: calc(14px + {marginHorizon})">{title}</div>
    {/if}
    <div class="tile" style="border-radius: {radius}; background-color: {color}; margin: {marginVertical} {marginHorizon}">
        <slot/>
    </div>
</div>
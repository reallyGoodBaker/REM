<script>
    export let marginHorizon = '10px';
    export let marginVertical = '6px';
    export let radius = '8px';
    export let color = 'var(--controlBrighter)';
    export let title = '';
</script>

<style>
    .container {
        position: relative;
        margin-top: 8px;
        width: 100%;
    }

    .tile {
        height: fit-content;
        overflow: hidden;
        box-sizing: border-box;
    }
</style>

<div class="container">
    {#if title}
    <div style="color: var(--controlDark); font-weight: bold; margin-bottom: 6px; margin-left: calc(14px + {marginHorizon})">{title}</div>
    {/if}
    <div class="tile" style="border-radius: {radius}; background-color: {color}; margin: {marginVertical} {marginHorizon}">
        <slot/>
    </div>
</div>
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
        margin-top: 10px;
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
    <div style="font-size: 0.9em; font-weight: bold; color: var(--controlDark); margin-bottom: 6px; margin-left: calc(22px + {marginHorizon})">{title}</div>
    {/if}
    <div class="tile" style="border-radius: {radius}; background-color: {color}; margin: {marginVertical} {marginHorizon}">
        <slot/>
    </div>
</div>
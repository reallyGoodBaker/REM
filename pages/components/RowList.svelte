<script>
    export let marginHorizon = '10px';
    export let marginVertical = '0px';
    export let radius = '8px';
    export let color = 'rgba(255,255,255,0.4)';
    export let shadowColor = 'rgba(0,0,0,0.2)';
    export let title = '';
</script>

<style>
    .container {
        margin-top: 24px;
        width: 100%;
    }

    .tile {
        height: fit-content;
    }
</style>

<div class="container">
    {#if title}
    <div style="color: var(--controlDark); font-weight: bold; margin-bottom: 12px; margin-left: calc(14px + {marginHorizon})">{title}</div>
    {/if}
    <div class="tile" style="border-radius: {radius}; background-color: {color}; width: calc(100% - {marginHorizon} * 2); box-shadow: 0px 0px 2px {shadowColor}; overflow: hidden; margin: {marginVertical} {marginHorizon}">
        <slot/>
    </div>
</div>
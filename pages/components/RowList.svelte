<script>
    export let marginHorizon = '10px';
    export let marginVertical = '0px';
    export let radius = '12px';
    export let color = 'rgba(255,255,255,0.4)';
    export let shadowColor = 'rgba(0,0,0,0.2)';
    export let title = '';
</script>

<style>

</style>

<div style="margin-top: 24px; width: 100%">
    {#if title}
    <div style="color: var(--controlColor); font-weight: bold; margin-bottom: 12px; margin-left: calc(14px + {marginHorizon})">{title}</div>
    {/if}
    <div style="border-radius: {radius}; background-color: {color}; width: calc(100% - {marginHorizon} * 2); height: fit-content; box-shadow: 0px 0px 4px {shadowColor}; overflow: hidden; margin: {marginVertical} {marginHorizon}">
        <slot/>
    </div>
</div>
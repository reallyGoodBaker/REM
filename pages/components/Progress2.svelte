<script>
    export let value = 0.5
    export let width = 100
    export let thumbWidth = 12

</script>

<style>
    .progress {
        --val: 0;
        width: calc(var(--val) * 100%);
        display: flex;
        flex-direction: row-reverse;
        background-color: var(--controlColor);
    }

    .thumb {
        height: 4px;
        margin: 2px;
        background-color: var(--controlBackgroundAcrylic);
        transition: all 0.2s ease-in-out;
    }

    .thumb:hover {
        background-color: var(--controlWhite);
    }

    .thumb:active {
        transform: scale(1.2);
    }
</style>

<div class="track" style="width: {width}px;">
    <div class="progress" style="--val: {value}">
        <div class="thumb" style="width: {thumbWidth}px;"></div>
    </div>
</div>
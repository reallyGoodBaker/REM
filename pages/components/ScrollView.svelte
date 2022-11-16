<script>
    let showBar = false
    function onMouseEnter() {
        showBar = true
    }

    function onMouseLeave() {
        showBar = false
    }
</script>


<style>
    .c {
        overflow: visible;
        position: relative;
        height: 100%;
        width: 100%;
        overflow: auto;
    }

    .c.hideBar {
        overflow: hidden;
    }

    .c::-webkit-scrollbar {
        width: 8px;
    }

    .c::-webkit-scrollbar-track {
        background-color: transparent;
    }

    .c::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: var(--controlGrayAcrylic);
    }

    .c::-webkit-scrollbar-thumb:hover {
        background-color: var(--controlBlackAcrylic);
    }
</style>


<div class="c {showBar? '': 'hideBar'}"
    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}
>
    <slot/>
</div>
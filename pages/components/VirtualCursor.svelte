<script>
export let active = false
export let enable = false
export let htmlElement
</script>

<style>
    .virt-cursor {
        top: 50%;
        left: 50%;
        display: none;
        pointer-events: none;
        box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);
        transform: translate(-50%, -50%) scale(1);
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: radial-gradient(
            transparent 0, transparent 9px,
            var(--controlDarker) 12px, var(--controlDarker) 13px,
            var(--controlBrighter) 14px
        );
        transition: transform 0.2s;
    }

    .virt-cursor.enable {
        display: block;
    }

    .virt-cursor.active {
        transform: translate(-50%, -50%) scale(0.6);
        background: radial-gradient(
            transparent 0, transparent 6px,
            var(--controlDarker) 8px, var(--controlDarker) 10px,
            var(--controlBrighter) 11px
        );
    }
</style>


<div class="virt-cursor{active? ' active': ''}{enable? ' enable': ''}" bind:this={htmlElement}></div>
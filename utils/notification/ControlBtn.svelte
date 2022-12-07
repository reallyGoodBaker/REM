<script>
    export let btn = {
        icon: '',
        label: '',
        onClick() {}
    }

    const Val = v => v

    export let wrapper = Val

    function wrap() {
        let func = btn.onClick || Val
        return wrapper(func)
    }
</script>

<style>
    .ibtn {
        font-family: iconfont;
        display: flex;
        justify-content: center;
        align-items: center;
        width: fit-content;
        min-width: 20px;
        height: 20px;
        cursor: pointer;
        padding: 6px;
        margin-left: 4px;
        border-radius: 4px;
    }

    .ibtn:hover {
        background-color: var(--fadeBright);
    }

    .ibtn:active {
        background-color: var(--fade);
    }
</style>

<div class="ibtn" title={btn.label} on:click={wrap()}>
    {btn.icon? btn.icon: btn.label}
</div>
<script>
    import Search from './Search.svelte'

    let fullScreen = false;

    function min() {
        hooks.send('win:min');
    }

    function close() {
        hooks.send('win:close');
    }

    function toggleMax() {
        if (fullScreen) {
            return unmax();
        }

        max();
    }

    function max() {
        hooks.send('win:max');
        fullScreen = true;
    }

    function unmax() {
        hooks.send('win:unmax');
        fullScreen = false;
    }

</script>


<style>
    .container {
        width: 100vw;
        height: 54px;
        -webkit-app-region: drag;
        justify-content: space-between;
    }

    .clk {
        -webkit-app-region: no-drag;
        font-family: iconfont;
        width: 32px;
        height: 32px;
        margin-right: 4px;
        border-radius: 8px;
        cursor: pointer;
        background-color: transparent;
        transition: background-color 0.12s,
            color 0.12s;
    }

    .clk:hover {
        background-color: rgba(0,0,0,0.2);
    }

    .clk.red:hover {
        background-color: red;
        color: #fff;
    }

    .btn-group {
        margin-top: 8px;
        align-self: flex-start;
    }

    .btn-group > div:last-child {
        margin-right: 8px;
    }

    .title {
        width: 115px;
        opacity: 0.7;
        padding-left: 24px;
    }

    .title.debug::after {
        content: 'Beta';
        color: red;
        font-size: small;
        margin: 0px 4px;
    }

</style>


<div class="column container">
    <div class="title debug">REM</div>
    <Search/>
    <div class="column btn-group">
        <div class="column clk" on:click={min}>–</div>
        <div class="column clk" on:click={toggleMax}>{fullScreen?'◱':'▢'}</div>
        <div class="column clk red" on:click={close}>⨉</div>
    </div>
</div>
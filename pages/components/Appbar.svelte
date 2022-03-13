<script>
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
        height: 32px;
        -webkit-app-region: drag;
        justify-content: space-between;
    }

    .clk {
        -webkit-app-region: no-drag;
        font-family: iconfont;
        width: 44px;
        height: 32px;
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

</style>


<div class="column container">
    <div></div>
    <div class="column">
        <div class="column clk" on:click={min}>–</div>
        <div class="column clk" on:click={toggleMax}>{fullScreen?'◱':'▢'}</div>
        <div class="column clk red" on:click={close}>╳</div>
    </div>
</div>
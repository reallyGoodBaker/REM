<script>
    let fullScreen = false;

    function min() {
        hooks.send("win:min");
    }

    function close() {
        hooks.send("win:close");
    }

    function toggleMax() {
        if (fullScreen) {
            return unmax();
        }

        max();
    }

    function max() {
        hooks.send("win:max");
    }

    function unmax() {
        hooks.send("win:unmax");
    }

    hooks.on("win:max", () => {
        fullScreen = true;
    });
    hooks.on("win:unmax", () => {
        fullScreen = false;
    });

    let reverse = false
    hooks.invoke('isMac').then(v => {
        if (v) {
            reverse = true
        }
    })
</script>

<style>
    .container {
        z-index: 9999;
        position: fixed;
        top: 0;
        width: calc(50vw - 152px);
        height: 54px;
        align-items: center;
        -webkit-app-region: drag;
    }

    .container.right {
        right: 0;
        justify-content: flex-end;
    }

    .container.left {
        left: 0;
        justify-content: flex-start;
    }

    .clk {
        font-family: iconfont;
        font-size: 14px;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        background-color: transparent;
        transition: background-color 0.12s, color 0.12s;
    }

    .clk.small {
        font-size: 12px;
    }

    .clk:hover {
        background-color: rgba(0, 0, 0, 0.2);
    }

    .clk.red:hover {
        background-color: red;
        color: #fff;
    }

    .btn-group {
        -webkit-app-region: no-drag;
        margin-top: 8px;
        align-self: flex-start;
    }

    .title {
        width: 115px;
        opacity: 0.7;
        padding-left: 24px;
    }

    .title.debug::after {
        content: "Beta";
        color: red;
        font-size: small;
        margin: 0px 4px;
    }

    .appbtns {
        padding: 4px;
        background-color: var(--noneAcrylicBackgroundColor);
        margin-right: 8px;
        border-radius: 8px;
    }

</style>

<div class="column container {reverse? 'left': 'right'}">
    <div class="column btn-group appbtns">
        <div class="column clk" on:click={min}>&#xe698;</div>
        <div class="column clk small" style="margin: 0 4px;" on:click={toggleMax}>
            {fullScreen ? "\ue891" : "\ue88f"}
        </div>
        <div class="column clk red" on:click={close}>⨉</div>
    </div>
</div>

<div class="column container {reverse? 'right': 'left'}">
    <div class="title{window.rem.isBeta ? ' debug' : ''}">REM</div>
</div>
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
</script>

<style>
    .container {
        z-index: 9999;
        position: fixed;
        top: 0;
        width: fit-content;
        height: 54px;
        align-items: center;
    }

    .container.right {
        right: 0;
    }

    .container.left {
        left: 0;
    }

    .clk {
        -webkit-app-region: no-drag;
        font-family: iconfont;
        font-size: 14px;
        width: 32px;
        height: 32px;
        /* margin-right: 4px; */
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

<div class="column container right">
    <div class="column btn-group appbtns">
        <div class="column clk" on:click={min}>&#xe698;</div>
        <div class="column clk small" style="margin: 0 4px;" on:click={toggleMax}>
            {fullScreen ? "\ue891" : "\ue88f"}
        </div>
        <div class="column clk red" on:click={close}>⨉</div>
    </div>
</div>

<div class="column container left">
    <div class="title{window.rem.isBeta ? ' debug' : ''}">REM</div>
</div>
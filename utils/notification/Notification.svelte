<script>
    import { onMount, setContext } from "svelte"
    import Image from "../../pages/components/Image.svelte"
    import ControlBtn from './ControlBtn.svelte'

    export let title = ''
    export let message = ''
    export let icon = '\ue758'
    export let controls = []
    export let timeout = 10000
    export let onCancel = () => {}

    setContext('close', close)

    function isFontIcon(str) {
        return str.length < 3
    }

    let container

    function close() {
        if (container) {
            if (typeof onCancel === 'function') {
                onCancel.call(container)
            }
            container.remove()
        }
    }

    onMount(() => setTimeout(close, timeout))

    function btnWrapper(func) {
        return (...args) => {
            func.apply(undefined, args)
            close()
        }
    }

</script>


<style>
    .container {
        box-sizing: border-box;
        border-radius: 8px;
        border: solid 1px var(--controlGray);
        width: calc(100% - 24px);
        margin: 0 12px 8px 0;
        pointer-events: all;
        overflow: hidden;
        background-color: var(--controlBrighter);
    }

    .icon {
        margin-right: 4px;
        align-self: center;
        font-family: iconfont, Roboto;
        width: 24px;
        height: 100%;
    }

    .header {
        box-sizing: border-box;
        padding: 0 4px 0 8px;
        width: 100%;
        height: 40px;
        justify-content: space-between;
        background-color: var(--controlBackgroundAcrylic);
    }

    .btn-group {
        box-sizing: border-box;
        padding: 0 4px 0 8px;
        width: 100%;
        height: 40px;
        justify-content: flex-end;
    }

    .message {
        box-sizing: border-box;
        padding: 8px 10px;
        width: 100%;
        height: fit-content;
    }

</style>


<div class="Column container" bind:this={container}>
    <div class="Row header">
        <div class="Row">
            <div class="icon">
                {#if !isFontIcon(icon)}
                    <Image src={icon} alt={icon} width={24} height={24}/>
                {:else}
                    {icon}
                {/if}
            </div>
            <div>{title}</div>
        </div>

        <div class="Row">
            <ControlBtn btn={{
                icon: '\ue6aa',
                label: '设置',
                onClick() {}
            }}/>
            <ControlBtn btn={{
                icon: '⨉',
                label: '关闭',
                onClick: close
            }}/>
        </div>
    </div>

    <div class="message">{message}</div>

    {#if Array.isArray(controls) && controls.length}
    <div class="Row btn-group">
        {#each controls as btn}
            <ControlBtn {btn} wrapper={btnWrapper}/>
        {/each}
    </div>
    {/if}
</div>
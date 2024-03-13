<script>
    import Progress from '../Progress.svelte'
    import Input from '../Input.svelte'
    import { createEventDispatcher } from 'svelte'

    export let label = ''
    export let comment = ''

    export let inputValue
    export let progressValue

    const emit = createEventDispatcher()

    function emitProgressChange(ev) {
        emit('progressChange', ev.detail)
    }

    function emitInputChange(ev) {
        emit('inputChange', ev.detail)
    }

    const style = 'height: 20px; width: 56px; padding: 0 4px; background-color: transparent;'
    
</script>

<style>
    .c {
        box-sizing: border-box;
        width: 100%;
        padding: 6px 16px;
        justify-content: space-between;
    }

    .comm {
        margin: 0;
        margin-left: 8px;
        color: var(--controlGray);
        font-size: small;
    }
</style>

<div class="Row c">
    <div class="Row">{label}<pre class="comm">{comment}</pre></div>
    <div class="Row">
        <Input containerStyle='{style}; margin-right: 8px;' cssText={style} on:change={emitInputChange} bind:value={inputValue}/>
        <Progress on:mousemove={emitProgressChange} on:mouseup={emitProgressChange} bind:value={progressValue}/>
    </div>
</div>
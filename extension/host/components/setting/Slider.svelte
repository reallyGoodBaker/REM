<script>
    import { createEventDispatcher } from "svelte"
    import Progress from "../../../../pages/components/Progress.svelte"
    import Input from "../../../../pages/components/Input.svelte"

    const emit = createEventDispatcher()
    export let label = ''
    export let value = 0
    export let inputValue = '0'
    export let progressValue = 0
    export let min = 0
    export let max = 1

    function clamp(n) {
        min = +min
        max = +max
        if (!Number.isFinite(n)) {
            return min
        }
        return Math.min(max, Math.max(min, n))
    }

    function syncFromValue(v) {
        min = +min
        max = +max
        const n = clamp(+v)
        inputValue = String(Math.round(n))
        progressValue = max === min ? 0 : ((n - min) / (max - min)) * 100
    }

    $: syncFromValue(value)

    const inputChange = ({ detail }) => {
        const n = clamp(+detail)
        const rounded = Math.round(n)
        inputValue = String(rounded)
        progressValue = max === min ? 0 : ((rounded - min) / (max - min)) * 100
        emit('inputChange', rounded)
        emit('change', rounded)
    }

    const progressChange = ({ detail }) => {
        if (detail == null || !Number.isFinite(+detail)) {
            return
        }

        const ratio = +detail / 100
        const n = clamp(min + (max - min) * ratio)
        const rounded = Math.round(n)
        inputValue = String(rounded)
        progressValue = max === min ? 0 : ((rounded - min) / (max - min)) * 100
        emit('progressChange', ratio)
        emit('change', rounded)
    }

    const style = 'height: 20px; width: 56px; padding: 0 4px; background-color: transparent;'
</script>

<style>
    .container {
        height: 32px;
        justify-content: space-between;
        width: 100%;
    }
</style>

<div class="Row container">
    <div>{label}</div>
    <div class="Row">
        <!-- svelte-ignore missing-declaration -->
        <Input containerStyle='{style};margin-right: 8px;' cssText={style} on:change={inputChange} bind:value={inputValue}/>
        <Progress bind:value={progressValue} on:mousedown={progressChange} on:mousemove={progressChange} on:mouseup={progressChange}/>
    </div>
</div>
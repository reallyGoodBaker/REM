<script>
    import { createEventDispatcher } from "svelte"
    import Progress from "../../../../pages/components/Progress.svelte"
    import Input from "../../../../pages/components/Input.svelte"

    const emit = createEventDispatcher()
    export let label = ''
    export let inputValue = '0'
    export let progressValue = 0
    export let min = 0
    export let max = 1

    const inputChange = ({ detail }) => {
        detail = +detail
        min = +min
        max = +max

        if (detail < min) {
            detail = min
        } else if (detail > max) {
            detail = max
        }

        progressValue = (detail - min) / (max - min) * 100
        inputValue = detail.toFixed(2)

        emit('inputChange', +detail)
        emit('change', +detail)
    }

    const progressChange = ({ detail }) => {
        detail /= 100
        inputValue = (min + (max - min) * detail).toFixed(2)
        emit('progressChange', detail)
        emit('change', inputValue)
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
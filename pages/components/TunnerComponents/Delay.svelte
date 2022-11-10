<script>
    import ProgressWithInput from './ProgressWithInput.svelte'
    import {setDelay, getDelay} from '../../../utils/player/process.js'

    const s = f => langMapping.s(f)
    
    let inputValue = getDelay().toFixed(3), progressValue = inputValue * 200

    function onInput({detail}) {
        detail = +detail
        let val = Math.max(Math.min(0.5, detail), 0)
        setDelay(val)
        inputValue = detail.toFixed(3)
        progressValue = val * 200
    }

    function onProgress({detail}) {
        detail /= 100
        let val = detail / 2
        setDelay(val)
        inputValue = val.toFixed(3)
    }
</script>

<ProgressWithInput
    label={s('delay')}
    bind:inputValue
    bind:progressValue
    on:inputChange={onInput}
    on:progressChange={onProgress}
/>
<script>
    import ProgressWithInput from './ProgressWithInput.svelte'
    import {setGain, getGain} from '../../../utils/player/process.js'

    const s = f => langMapping.s(f)
    
    let inputValue = getGain().toFixed(2), progressValue = (inputValue/2) * 100

    function onInput({detail}) {
        detail = +detail
        let val = Math.max(Math.min(2, detail), 0)
        setGain(val)
        inputValue = detail.toFixed(2)
        progressValue = (val/2) * 100
    }

    function onProgress({detail}) {
        detail /= 100
        let val = detail * 2
        setGain(val)
        inputValue = val.toFixed(2)
    }
</script>

<ProgressWithInput
    label={s('gain')}
    bind:inputValue
    bind:progressValue
    on:inputChange={onInput}
    on:progressChange={onProgress}
/>
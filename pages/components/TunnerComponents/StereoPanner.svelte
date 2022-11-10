<script>
    import ProgressWithInput from './ProgressWithInput.svelte'
    import {setStereoPanner, getStereoPan} from '../../../utils/player/process.js'
    import { onMount } from 'svelte'

    const s = f => langMapping.s(f)
    
    let inputValue = getStereoPan().toFixed(2), progressValue = (+inputValue + 1) * 50

    function onInput({detail}) {
        detail = +detail
        let val = Math.max(Math.min(1, detail), -1)
        setStereoPanner(val)
        inputValue = detail.toFixed(2)
        progressValue = (+inputValue + 1) * 50
    }

    function onProgress({detail}) {
        detail /= 100
        let val = detail * 2 - 1
        setStereoPanner(val)
        inputValue = val.toFixed(2)
    }
</script>

<ProgressWithInput
    label={s('stereo_pan')}
    bind:inputValue
    bind:progressValue
    on:inputChange={onInput}
    on:progressChange={onProgress}
/>
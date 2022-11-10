<script>
    import ProgressWithInput from './ProgressWithInput.svelte'
    import {setFade, getFader} from '../../../utils/player/process.js'

    const s = f => langMapping.s(f)

    let fader = getFader()

    function setFader(fader) {
        setFade(fader.fadeIn, fader.fadeOut)
    }
    
    let fadeInInputValue = fader.fadeIn.toFixed(3), fadeInProgressValue = fadeInInputValue * 200,
        fadeOutInputValue = fader.fadeOut.toFixed(3), fadeOutProgressValue = fadeOutInputValue * 200


    function onFadeInInput({detail}) {
        detail = +detail
        let val = fader.fadeIn = Math.max(Math.min(0.5, detail), 0)
        setFader(fader)
        fadeInInputValue = detail.toFixed(3)
        fadeInProgressValue = val * 200
    }

    function onFadeInProgress({detail}) {
        detail /= 100
        let val = fader.fadeIn = detail / 2
        setFader(fader)
        fadeInInputValue = val.toFixed(3)
    }

    function onFadeOutInput({detail}) {
        detail = +detail
        let val = fader.fadeOut = Math.max(Math.min(0.5, detail), 0)
        setFader(fader)
        fadeOutInputValue = detail.toFixed(3)
        fadeOutProgressValue = val * 200
    }

    function onFadeOutProgress({detail}) {
        detail /= 100
        let val = fader.fadeOut = detail / 2
        setFader(fader)
        fadeOutInputValue = val.toFixed(3)
    }
</script>

<!-- <div style="margin-bottom: 12px; margin-left: 16px;">淡入淡出设定</div> -->
<ProgressWithInput
    label={s('fade_in')}
    bind:inputValue={fadeInInputValue}
    bind:progressValue={fadeInProgressValue}
    on:inputChange={onFadeInInput}
    on:progressChange={onFadeInProgress}
/>
<ProgressWithInput
    label={s('fade_out')}
    bind:inputValue={fadeOutInputValue}
    bind:progressValue={fadeOutProgressValue}
    on:inputChange={onFadeOutInput}
    on:progressChange={onFadeOutProgress}
/>
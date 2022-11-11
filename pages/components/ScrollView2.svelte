<script>
import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
import { rem } from '../../utils/rem.js'

let outerContainer
    ,meter
    ,scrollTrack
    ,content
    ,scrollThumb

export let minThumbHeight = 12

let thumbHeight = 0
    ,hideTrack = false

let outerContainerHeight
    ,contentHeight
    ,heightPercentOfThumb
    ,trackHeight
    ,trackOffsetPage

function updateValues() {
    outerContainerHeight = outerContainer.offsetHeight
    trackHeight = scrollTrack.offsetHeight
    contentHeight = meter.offsetHeight
    heightPercentOfThumb = !contentHeight? 1: Math.min(outerContainerHeight/contentHeight, 1)
    thumbHeight = heightPercentOfThumb * trackHeight
    if (thumbHeight < minThumbHeight) {
        thumbHeight = minThumbHeight
        heightPercentOfThumb = !trackHeight? 1: Math.min(thumbHeight/trackHeight, 1)
    }
    hideTrack = heightPercentOfThumb >= 1
    trackOffsetPage = scrollTrack && scrollTrack.getBoundingClientRect().top
}

function updateScrollPosition() {
    if (thumbHeight !== minThumbHeight) {
        thumbTop = content.scrollTop/contentHeight * trackHeight
    } else {
        thumbTop = (trackHeight - thumbHeight)/(contentHeight - outerContainerHeight) * content.scrollTop
    }
}

export function update() {
    updateValues()
    updateScrollPosition()
    emit('afterUpdated')
}

let isHoverScrollTrack = false
onMount(async() => {
    scrollTrack.addEventListener('mouseenter', () => {
        isHoverScrollTrack = true
    })

    scrollTrack.addEventListener('mouseleave', () => {
        if (!_draggingMode) {
            isHoverScrollTrack = false
        }
    })

    rem.on('pageContentChange', update)
    rem.on('scroll', controllerScrollTo)
    rem.on('scroll-up', scrollup)
})

onDestroy(() => {
    rem.off('pageContentChange', update)
    rem.off('scroll-up', scrollup)
    rem.off('scroll', controllerScrollTo)
})

function controllerScrollTo(offset) {
    offset = Math.min(Math.max(thumbHeight/2, offset), trackHeight - thumbHeight/2)
    updateScrollPosition()
    fastScrollTo((offset - thumbHeight/2)/(trackHeight - thumbHeight))
}

let thumbTop = 0

async function scrollup(offset) {
    if (!outerContainer) {
        return
    }
    const stickSpeedRatio = await store.get('stickScrollSpeedRatio')
    let ratio = !stickSpeedRatio? 0.6: stickSpeedRatio[stickSpeedRatio[0] + 1].value
    const scrollOffset = content.scrollTop + offset * ratio
    fastScrollTo(scrollOffset/contentHeight)
    updateScrollPosition()
}

function fastScrollTo(ratio) {
    ratio = Math.min(Math.max(0, ratio), 1)
    content.scrollTo({
        top: ratio * (contentHeight || 0),
    })
    updateScrollPosition()
}

let _mouseThumbOffset = 0
    ,_draggingMode = false

function onClickScrollTrack(ev) {
    _draggingMode = true
    let offset = ev.offsetY
    offset = ev.pageY - trackOffsetPage
    fastScrollTo((offset - thumbHeight/2)/trackHeight)
    _mouseThumbOffset = ev.offsetY - thumbTop
}

function pressScrollThumb(ev) {
    ev.stopPropagation()
    isHoverScrollTrack = true
    _mouseThumbOffset = ev.offsetY
    _draggingMode = true
}

function releaseScrollThumb(ev) {
    _mouseThumbOffset = 0
    _draggingMode = false
    if (!ev.path.includes(scrollTrack)) {
        isHoverScrollTrack = false
    }
}

function dragScrollThumb(ev) {
    if (!_draggingMode) {
        return
    }
    const scrollOffset = ev.pageY - trackOffsetPage - _mouseThumbOffset
    fastScrollTo(scrollOffset/trackHeight)
}

function wheelChange(ev) {
    ev.stopPropagation()
    const scrollOffset = Math.max(Math.min(content.scrollTop + ev.deltaY, contentHeight), 0)
    fastScrollTo(scrollOffset/contentHeight)
}

const emit = createEventDispatcher()

onMount(() => {
    window.addEventListener('resize', update)
    scrollTrack.addEventListener('mousedown', onClickScrollTrack)
    scrollThumb.addEventListener('mousedown', pressScrollThumb)
    document.addEventListener('mouseup', releaseScrollThumb)
    document.addEventListener('mousemove', dragScrollThumb)
    outerContainer.addEventListener('wheel', wheelChange, {passive: true})
})

onDestroy(() => {
    window.removeEventListener('resize', update)
    scrollTrack.removeEventListener('mousedown', onClickScrollTrack)
    scrollThumb.removeEventListener('mousedown', pressScrollThumb)
    document.removeEventListener('mouseup', releaseScrollThumb)
    document.removeEventListener('mousemove', dragScrollThumb)
    outerContainer.removeEventListener('wheel', wheelChange)
})

export function prepared() {
    return !!content
}

export function getOffsetRatio() {
    return (content?.scrollTop || 0)/(contentHeight || 1)
}

export function setOffsetRatio(ratio) {
    fastScrollTo(ratio)
}

export function scrollTo(pos) {
    if (content) {
        content.scrollTop = pos
    }
}

</script>

<style>
    .out-container {
        position: relative;
        height: 100%;
        width: 100%;
        contain: paint;
    }

    .restrict-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .track {
        --top: 0;
        --height: 100%;
        position: absolute;
        border-radius: 8px;
        right: 0;
        top: var(--top);
        height: var(--height);
        min-height: 16px;
        width: 16px;
        background-color: transparent;
        transition: all 0.12s;
    }

    .thumb {
        --top: 0;
        --height: 0;
        position: absolute;
        top: var(--top);
        height: var(--height);
        width: 100%;
        transition: height 0.2s, top 0.04s;
    }

    .thumb::before {
        content: '';
        position: absolute;
        right: 2px;
        height: 100%;
        width: 4px;
        border-radius: 4px;
        background-color: var(--fade);
        transition: all 0.12s;
    }

    .hide {
        opacity: 0;
    }

    .track.hover {
        background-color: var(--acrylicBackgroundColor);
    }
    .track.hover > .thumb {
        transition: height 0.2s;
    }
    .track.hover > .thumb::before {
        width: 12px;
        border-radius: 6px;
        background-color: #555;
    }

    .meter {
        box-sizing: border-box;
        width: fit-content;
        height: fit-content; 
    }


</style>



<div class="out-container" bind:this={outerContainer}>
    <div class="restrict-container" bind:this={content}>
        <div class="meter" bind:this={meter} style="width: 100%;">
            <slot/>
        </div>
    </div>

    <div class="track {isHoverScrollTrack? 'hover': ''} {hideTrack? 'hide': ''}" bind:this={scrollTrack}>
        <div bind:this={scrollThumb}
            class="thumb" 
            style="--height: {thumbHeight}px; --top: {thumbTop}px; min-height: {minThumbHeight}px"
        ></div>
    </div>
</div>

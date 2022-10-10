<script>
import { onDestroy, onMount } from 'svelte';
import Measurable from './Measurable.svelte'

let outerContainer
    ,meter
    ,scrollTrack
    ,content
    ,scrollThumb

let thumbHeight = 0
    ,hideTrack = false

let outerContainerHeight,
    contentHeight,
    heightPercentOfThumb,
    trackHeight

function updateValues() {
    outerContainerHeight = outerContainer.offsetHeight
    trackHeight = scrollTrack.offsetHeight
    contentHeight = meter.currentSize().height
    heightPercentOfThumb = !contentHeight? 1: Math.min(outerContainerHeight/contentHeight, 1)
    thumbHeight = heightPercentOfThumb * trackHeight
    hideTrack = heightPercentOfThumb > 0.9995
}

function updateScrollPosition() {
    thumbTop = content.scrollTop/contentHeight * trackHeight
}

export function update() {
    updateValues()
    updateScrollPosition()
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
    rem.on('scroll-up', scrollup)
})

onDestroy(() => {
    rem.off('pageContentChange', update)
    rem.off('scroll-up', scrollup)
    rem.emit('__pageUnfold')
})

let thumbTop = 0

function scrollup(scrollOffset) {
    fastScrollTo(scrollOffset/contentHeight)
    thumbTop = Math.max(0, Math.min(scrollOffset/contentHeight*trackHeight, trackHeight - thumbHeight))
}

function fastScrollTo(ratio) {
    ratio = Math.min(Math.max(0, ratio), 1)
    content.scrollTo({
        top: ratio * (contentHeight || 0)
    })
}

let _useSmoothTranslate = false
function thumbSmoothMoveTo(top) {
    _useSmoothTranslate = true
    requestAnimationFrame(() => {
        thumbTop = top
        _useSmoothTranslate = false
    })
}

let _mouseThumbOffset = 0
    ,_draggingMode = false

function onClickScrollTrack(ev) {
    _draggingMode = true
    let offset = ev.offsetY
    offset = Math.min(Math.max(thumbHeight/2, offset), trackHeight - thumbHeight/2)
    thumbSmoothMoveTo(offset - thumbHeight/2)
    fastScrollTo((offset - thumbHeight/2)/(trackHeight - thumbHeight))
}

function pressScrollThumb(ev) {
    ev.stopPropagation()
    isHoverScrollTrack = true
    _mouseThumbOffset = ev.offsetY
    _draggingMode = true
}

function releaseScrollThumb() {
    isHoverScrollTrack = false
    _mouseThumbOffset = 0
    _draggingMode = false
}

function dragScrollThumb(ev) {
    if (!_draggingMode) {
        return
    }
    const scrollOffset = ev.pageY - scrollTrack.getBoundingClientRect().top - _mouseThumbOffset
    thumbTop = Math.max(Math.min(scrollOffset, trackHeight - thumbHeight), 0)
    fastScrollTo(scrollOffset/trackHeight)
}

function wheelChange(ev) {
    const scrollOffset = Math.max(Math.min(content.scrollTop + ev.deltaY, contentHeight), 0)
    thumbTop = Math.max(0, Math.min(scrollOffset/contentHeight*trackHeight, trackHeight - thumbHeight))
    fastScrollTo(scrollOffset/contentHeight)
}

onMount(() => {
    scrollTrack.addEventListener('mousedown', onClickScrollTrack)
    scrollThumb.addEventListener('mousedown', pressScrollThumb)
    document.addEventListener('mouseup', releaseScrollThumb)
    document.addEventListener('mousemove', dragScrollThumb)
    outerContainer.addEventListener('wheel', wheelChange, {passive: true})
})

onDestroy(() => {
    scrollTrack.removeEventListener('mousedown', onClickScrollTrack)
    scrollThumb.removeEventListener('mousedown', pressScrollThumb)
    document.removeEventListener('mouseup', releaseScrollThumb)
    document.removeEventListener('mousemove', dragScrollThumb)
    outerContainer.removeEventListener('wheel', wheelChange)
})

</script>

<style>
    .out-container {
        position: relative;
        height: 100%;
        width: 100%;
        contain: paint;
        overflow: hidden;
    }

    .restrict-container {
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
        --height: 100%;
        position: absolute;
        top: var(--top);
        height: var(--height);
        width: 100%;
        transition: height 0.2s;
    }

    .thumb::before {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        height: 100%;
        width: 6px;
        border-radius: 4px;
        background-color: var(--controlGray);
        transition: all 0.12s;
    }
    .thumb.smooth-translate {
        transition: top 0.1s;
    }

    .hide {
        opacity: 0;
    }

    .track.hover {
        background-color: var(--acrylicBackgroundColor);
    }
    .track.hover > .thumb::before {
        width: 12px;
        border-radius: 6px;
        background-color: #555;
    }


</style>



<div class="out-container" bind:this={outerContainer}>
    <div class="restrict-container" bind:this={content}>
        <Measurable bind:this={meter} cssStyle="width: 100%;">
            <slot/>
        </Measurable>
    </div>

    <div class="track {isHoverScrollTrack? 'hover': ''} {hideTrack? 'hide': ''}" bind:this={scrollTrack}>
        <div bind:this={scrollThumb} class="thumb {_useSmoothTranslate? 'smooth-translate': ''}" style="--height: {thumbHeight}px;--top: {thumbTop}px"></div>
    </div>
</div>

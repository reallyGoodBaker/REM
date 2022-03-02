<script>
    let scrollView, scrollThumb, ph, h, res, outerWindow, scale;

    import {onDestroy, onMount} from 'svelte';
    import Measurable from './Measurable.svelte';

    let showScrollBar = false;

    function init(innerHeight) {
        ph = calcHeight(scrollView);
        h = innerHeight;

        if(ph >= h) return showScrollBar = false;
        else showScrollBar = true;

        res = (h-ph)*ph/h;
        scale = ph/h;

        try {
            scrollThumb.style.setProperty('--thumb-height', ph*scale+ 'px');
        } catch (error) {}
    }

    function calcHeight(element) {
        let res;
        try {
            res = element.offsetHeight;
        } catch (error) {
            res = 0;
        }
        return res;
    }

    let mousedown = false, ry, raw, oy, keepStretch = false, thumbOY = 0;
    function mouseDown(ev) {
        mousedown = true;
        ry = ev.screenY;
        raw = scrollThumb.offsetTop;
    }

    onMount(() => {
        outerWindow.addEventListener('mousemove', dragThumb);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('wheel', ev => {
            if (!~ev.path.indexOf(outerWindow)) return;
            thumbOY += ~~ev.deltaY*scale;
            if (thumbOY  < 0) thumbOY = 0;
            if (thumbOY  > res) thumbOY = res;
            scrollTo(thumbOY);
        });
    });


    function dragThumb(ev) {
        if (mousedown) {
            keepStretch = true;
            oy = ev.screenY - ry;
            thumbOY = raw + oy;
            scrollTo(thumbOY);
        }
    }

    function endDrag() {
        keepStretch = false;
        mousedown = false;
    }

    let triggered = false;
    function scrollTo(thumbOY) {
        try {
            if (isNaN(thumbOY)) return;
            if (thumbOY <= 0) {
                triggered = true;
                __emitter.emit('__pageUnfold');
                thumbOY = 0;
            }
            if (thumbOY  > res) thumbOY = res;
            if (!triggered) {
                __emitter.emit('__pageFold');
            } else {
                triggered = false;
            }
            scrollThumb.style.setProperty('--progress', thumbOY + 'px');
            scrollView.scrollTo({
                left: 0, 
                top: thumbOY*h/ph,
                behavior: 'auto'
            });
        } catch (error) {}
    }


    let meter;

    export function measure() {
        meter.measure((data) => {
            init(data.height);
        });
    }

    onMount(measure);
    onDestroy(() =>  __emitter.emit('__pageUnfold'))

    export function recalc() {
        meter.measure(({height}) => {
            init(height);
        });
        meter.forceUpdate();
    }

</script>


<style>
    .c {
        overflow: hidden;
        position: relative;
        height: 100%;
        width: 100%;
    }

    .contaienr {
        overflow: hidden;
        height: 100%;
        width: 100%;
    }

    .bar {
        position: absolute;
        top: 0px;
        right: 4px;
        height: 100%;
        width: 6px;
        background-color: transparent;
        opacity: 0.5;
        transition: all 0.1s ease;
    }

    .bar.active, .bar:hover {
        opacity: 1;
        right: 0px;
        width: 16px;
        background-color: rgba(255,255,255,0.3);
    }

    .thumb {
        --progress: 0px;
        --thumb-height: 0px;
        margin-top: var(--progress);
        background-color: #888;
        width: 100%;
        border-radius: 3px;
        height: var(--thumb-height);
        transition: height 0.2s;
    }

    .bar > .thumb:hover, .bar.active > .thumb {
        border-radius: 0px;
    }

    .hide {
        display: none;
    }

</style>


<div class="c" bind:this={outerWindow}>
    <div class="contaienr" bind:this={scrollView}>
        <Measurable
            bind:this={meter}
            cssStyle={'width: 100%'}
        >
            <slot/>
        </Measurable>
    </div>

    <div class="bar{keepStretch?' active': ''}{!showScrollBar?' hide':''}">
        <div class="thumb" bind:this={scrollThumb} on:mousedown={mouseDown}></div>
    </div>
</div>
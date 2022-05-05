<script>
    let scrollView, scrollThumb, ph, h, res, outerWindow, scale;

    import {onDestroy, onMount} from 'svelte';
    import Measurable from './Measurable.svelte';

    let showScrollBar = false;
    let mousedown = false,
        ry,
        raw,
        oy,
        keepStretch = false,
        thumbOY = 0,
        shouldRestore = true,
        autoDisableRestore = null

    function init(innerHeight) {
        ph = calcHeight(scrollView);
        h = innerHeight;

        if(ph >= h) {
            thumbOY = 0
            scrollTo(0)
            return showScrollBar = false
        }
        else showScrollBar = true;

        res = (h-ph)*ph/h;
        scale = ph/h;

        try {
            if(scrollThumb) scrollThumb.style.setProperty('--thumb-height', ph*scale+ 'px');

            const {save} = Pager.getContext()
            if (shouldRestore && save) {
                scrollTo(thumbOY = save.pageOffsetY)
            }

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

    function mouseDown(ev) {
        mousedown = true;
        ry = ev.screenY;
        raw = scrollThumb.offsetTop;
    }

    export function disableAutoRestore() {
        shouldRestore = false
    }

    /**
     * @param {(stopWaiting: () => void) => void} until
     */
    export function keepWaiting(until) {
        clearTimeout(autoDisableRestore)
        until(disableAutoRestore)
    }

    onMount(() => {
        outerWindow.addEventListener('mousemove', dragThumb);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('wheel', ev => {
            if (!showScrollBar) return
            if (isNaN(thumbOY)) {
                thumbOY = 0
            }
            if (!~ev.path.indexOf(outerWindow)) return;
            thumbOY += ~~ev.deltaY*scale;
            if (thumbOY  < 0) thumbOY = 0;
            if (thumbOY  > res) thumbOY = res;
            scrollTo(thumbOY);
        });
        autoDisableRestore = setTimeout(() => {
            disableAutoRestore()
        }, 2000);
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
            if(scrollThumb) scrollThumb.style.setProperty('--progress', thumbOY + 'px');
            scrollView.scrollTo({
                left: 0, 
                top: thumbOY*h/ph,
                behavior: 'auto'
            });
        } catch (error) {}
    }


    let meter;

    export function measure() {
        return new Promise(res => {
            meter.measure(({height}) => {
                init(height);
                res()
            });
        })
    }

    onMount(measure);
    onDestroy(() => __emitter.emit('__pageUnfold'))
    Pager.beforeSwitch(() => {
        const {save} = Pager.getContext()
        save.pageOffsetY = thumbOY
    })

    export async function recalc() {
        measure()
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
        opacity: 0.4;
        transition: all 0.1s ease;
    }

    .bar.active, .bar:hover {
        opacity: 1;
        right: 0px;
        width: 16px;
        background-color: rgba(255,255,255,0.3);
    }

    .thumb {
        --progress: 0;
        --thumb-height: 0;
        margin-top: var(--progress);
        background-color: #555;
        width: 100%;
        border-radius: 5px;
        height: var(--thumb-height);
        transition: height 0.3s, opacity 0.3s;
    }

    .bar.active > .thumb, .bar > .thumb:hover {
        border-radius: 0px;
    }

    .hide {
        pointer-events: none;
    }

    .hide > .thumb {
        height: calc(100% + 0px);
        opacity: 0;
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
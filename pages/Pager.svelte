<script>
    import Blank from "./Blank.svelte";
    import {anim} from '../utils/anims.js';

    let _page = Blank;
    let _props = {};

    function _display(page, props) {
        if (_page === page) {
            _page = Blank;
            _props = props;
            setTimeout(() => {
                _page = page;
            });
            return;
        }

        _props = props;
        _page = page;
    }

    let innerWindow;

    export async function display(page, props) {
        await anim(innerWindow, [
            {opacity: 1, transform: 'scale(1)'},
            {opacity: 0, transform: 'scale(1.1)'}
        ], {
            duration: 90,
            ease: 'ease-in',
            fill: 'forwards'
        });

        _display(page, props);

        requestIdleCallback(async () => {
            await anim(innerWindow, [
                {opacity: 0, transform: 'scale(0.9)'},
                {opacity: 1, transform: 'scale(1)'}
            ], {
                duration: 70,
                ease: 'ease-out',
                fill: 'forwards'
            });

            appHooks.emit('pageSwipeAnimFinish');
        })
    }
    
</script>


<style>
    .container {
        width: 100vw;
        height: calc(100% - 72px);
        overflow: hidden;
        position: relative;
        /* transform: translateZ(0); */
    }

    .innerWindow {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
    }

</style>

<div class="container  row">
    <div class="innerWindow row" bind:this={innerWindow}>
        <svelte:component this={_page} {..._props}/>
    </div>
</div>

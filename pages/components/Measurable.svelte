<script>
    let measureMeter;

    export let cssStyle;

    export function measure(callback) {

        if(measureMeter.offsetHeight && measureMeter.offsetWidth) {
            callback({
                width: measureMeter.offsetWidth,
                height: measureMeter.offsetHeight
            });
        }

        new MutationObserver((mutions, observer) => {

            observer.disconnect();

            try {
                callback({
                    width: measureMeter.offsetWidth,
                    height: measureMeter.offsetHeight
                });
            } catch (error) {}
            
        }).observe(measureMeter, {childList: true, subtree: true, attributes: true});
    }

    export function forceUpdate() {
        measureMeter.setAttribute('__force-update__', '');
        measureMeter.removeAttribute('__force-update__');
    }

</script>


<style>
    .container {
        box-sizing: border-box;
        width: fit-content;
        height: fit-content;
    }
</style>


<div class="container" bind:this={measureMeter} style={cssStyle}>
    <slot/>
</div>
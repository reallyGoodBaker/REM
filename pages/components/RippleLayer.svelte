<script>
    export let rippleColor = '';
    export let component = null;
    export let cssStyle = '';

    let container = null;

    function onClick(ev) {
        drawRipple(container, ev, fadeOut, rippleColor);
    }

    function drawRipple(container, ev, callback, rippleColor) {
        const {left, top} = container.getBoundingClientRect();
        const {pageX, pageY} = ev;
        const {offsetWidth, offsetHeight} = container;
        const radius = Math.sqrt(offsetHeight**2 + offsetWidth**2)/2;

        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.opacity = '0.4';
        ripple.style.pointerEvents = 'none';
        container.appendChild(ripple);

        ripple.animate([
            {top: `${pageY - top}px`, left: `${pageX - left}px`, width: '0px',
                height: '0px', backgroundColor: `${rippleColor||'var(--controlColor)'}`},
            {top: `${offsetHeight/2 - radius}px`, left: `${offsetWidth/2 - radius}px`,
                width: `${2*radius}px`, height: `${2*radius}px`, backgroundColor: `${rippleColor||'var(--controlColor)'}`}
        ], {duration: 320, fill: "forwards", easing: "cubic-bezier(0.05, 0.7, 0.2, 1)"}).onfinish = () => {
            typeof callback === 'function' && callback.call(ripple, ripple);
        };
    }

    function fadeOut(ele) {
        ele.animate({opacity: ['0.4', '0']}, 200).onfinish = () => {
            ele.remove();
        }
    }
</script>



<style>
    .container {
        position: relative;
        overflow: hidden;
    }
</style>


<div on:mousedown={onClick} bind:this={container} class="container" style={cssStyle}>
    {#if component}
    <svelte:component this={component} {...$$props}/>
    {:else}
    <slot {...$$props}/>
    {/if}
</div>
<script>
    export let rippleColor = ''
    export let component = null
    export let cssStyle = ''
    export let useHoverLayer = false

    let container = null

    function onClick(ev) {
        if (ev.button) {
            return
        }

        drawRipple(container, ev, rippleColor)
    }

    function drawRipple(container, ev, rippleColor) {
        const {left, top} = container.getBoundingClientRect()
        const {pageX, pageY} = ev
        const {offsetWidth, offsetHeight} = container
        const radius = Math.sqrt(offsetHeight**2 + offsetWidth**2)/2

        const ripple = document.createElement('div')
        ripple.style.position = 'absolute'
        ripple.style.borderRadius = '50%'
        ripple.style.opacity = '0.4'
        ripple.style.pointerEvents = 'none'
        container.appendChild(ripple)

        ripple.animate([
            {top: `${pageY - top}px`, left: `${pageX - left}px`, width: '0px',
                height: '0px', backgroundColor: `${rippleColor||'var(--controlColor)'}`},
            {top: `${offsetHeight/2 - radius}px`, left: `${offsetWidth/2 - radius}px`,
                width: `${2*radius}px`, height: `${2*radius}px`, backgroundColor: `${rippleColor||'var(--controlColor)'}`}
        ], {duration: 800, fill: "forwards", easing: "cubic-bezier(0.05, 0.8, 0.2, 1)"})

        const cancelAnim = () => {
            fadeOut(ripple)
            document.removeEventListener('mouseup', cancelAnim)
        }

        document.addEventListener('mouseup', cancelAnim)

    }

    function fadeOut(ele) {
        ele.animate({opacity: ['0.4', '0']}, 200).onfinish = () => {
            ele.remove()
        }
    }
</script>



<style>
    .container {
        position: relative;
        overflow: hidden;
    }

    .use-hover::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transition: 0.1s;
        pointer-events: none;
    }

    .use-hover:hover::after {
        background-color: var(--fadeBright);
    }
</style>


<div on:mousedown={onClick} bind:this={container} class="container {useHoverLayer? 'use-hover': ''}" style={cssStyle}>
    {#if component}
    <svelte:component this={component} {...$$props}/>
    {:else}
    <slot {...$$props}/>
    {/if}
</div>
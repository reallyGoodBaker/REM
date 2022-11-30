<script>
    import {onMount} from 'svelte'

    let canvas, ctx

    export let size = 200
    export let min = 60
    export let max = 270
    export let transformDuration = 500
    export let transformationDelay = 500
    export let angularVelocity = 0.4
    export let roundCap = true
    export let lineWidth = 6
    export let strokeStyle = getComputedStyle(document.body).getPropertyValue('--controlColor')

    const ratio = window.devicePixelRatio

    let csize = ratio * size

    let start = 0,
        end = min

    const _a = Math.PI / 180
    function render() {
        radStart = start * _a
        radEnd = end * _a
    }

    const add = (n, dn) => {
        return (n + dn) % 360
    }

    const circle = (() => {
        let counter = 0
        return dt => {
            counter += dt
            start = add(start, angularVelocity * dt)
            end = add(end, angularVelocity * dt)
            render()
            if (counter > transformationDelay) {
                state = state === 3? 0: state + 1
                return counter = 0
            }
        }
    })()

    const stretch = (() => {
        let counter = 0
        let maxV = (max - min) / transformDuration
        let a = maxV / transformDuration
        let half = transformDuration / 2
        let v = () => {
            if (counter > half) {
                return maxV - (counter - half) * a
            }

            return counter * a
        }
        return dt => {
            counter += dt
            start = add(start, angularVelocity * dt)
            end = add(end, (2 * v() + angularVelocity) * dt)
            
            if (counter > transformDuration) {
                end = start + max
                state++
                render()
                return counter = 0
            }

            render()
        }
    })()

    const shrink = (() => {
        let counter = 0
        let maxV = (max - min) / transformDuration
        let a = maxV / transformDuration
        let half = transformDuration / 2
        let v = () => {
            if (counter > half) {
                return maxV - (counter - half) * a
            }

            return counter * a
        }
        return dt => {
            counter += dt
            start = add(start, (2*v() + angularVelocity) * dt)
            end = add(end, angularVelocity * dt)
            
            if (counter > transformDuration) {
                start = end - min
                state++
                render()
                return counter = 0
            }

            render()
        }
    })()

    let state = 0
    const f = dt => {
        if (state == 0) {
            stretch(dt)
        }

        if (state == 1) {
            circle(dt)
        }

        if (state == 2) {
            shrink(dt)
        }

        if (state == 3) {
            circle(dt)
        }
    }

    let radStart = 0, radEnd = 0

    let timeStamp
    const drawOneFrame = timestamp => {
        if (!timeStamp) {
            timeStamp = timestamp
            requestAnimationFrame(drawOneFrame)
            return
        }

        const dt = timestamp - timeStamp
        timeStamp = timestamp

        f(dt)

        ctx.strokeStyle = strokeStyle
        ctx.clearRect(0, 0, size, size)
        ctx.beginPath()
        ctx.arc(size/2, size/2, (size - lineWidth) / 2, radStart, radEnd)
        ctx.stroke()
        ctx.closePath()
        requestAnimationFrame(drawOneFrame)
    }

    onMount(() => {
        ctx = canvas.getContext('2d')
        ctx.scale(ratio, ratio)

        ctx.lineWidth = lineWidth
        if (roundCap) {
            ctx.lineCap = 'round'
        }

        requestAnimationFrame(drawOneFrame)
    })
</script>

<canvas
    bind:this={canvas}
    style="width: {size}px; height: {size}px"
    width={csize} height={csize}
></canvas>
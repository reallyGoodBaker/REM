export function vsync(handler) {
    if (typeof handler !== 'function') {
        throw 'handler should be type of function'
    }

    let timeStamp
    let end = false
    const onFrameFresh = ts => {
        if (!timeStamp) {
            timeStamp = ts
            requestAnimationFrame(onFrameFresh)
        }

        const dt = ts - timeStamp
        timeStamp = ts

        handler.call(undefined, dt, ts)
        if (end) return

        requestAnimationFrame(onFrameFresh)
    }

    requestAnimationFrame(onFrameFresh)

    return {
        cancel: () => {
            end = true
        }
    }
}
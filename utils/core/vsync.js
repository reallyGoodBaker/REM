export function vsync(handler) {
    if (typeof handler !== 'function') {
        throw 'handler should be type of function'
    }

    let timeStamp
    let loopid
    const onFrameFresh = ts => {
        if (!timeStamp) {
            timeStamp = ts
            loopid = requestAnimationFrame(onFrameFresh)
        }

        const dt = ts - timeStamp
        timeStamp = ts

        handler.call(undefined, dt, ts)
        loopid = requestAnimationFrame(onFrameFresh)
    }

    requestAnimationFrame(onFrameFresh)

    return {
        cancel: () => {
            cancelAnimationFrame(loopid)
        }
    }
}
export function interval(handler, ms) {
    const loopid = setInterval(handler, ms)

    return {
        cancel: () => {
            clearInterval(loopid)
        }
    }
}
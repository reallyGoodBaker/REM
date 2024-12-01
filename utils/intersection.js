export function useIntersectionObserver(node) {
    let OnVisible, OnInvisible = OnVisible = Function.prototype

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            requestIdleCallback(async () => {
                if (entry.isIntersecting) {
                    OnVisible.call(node)
                } else {
                    OnInvisible.call(node)
                }
            })
        })
    })

    observer.observe(node)

    return {
        visible(onVisible) {
            OnVisible = onVisible
        },
        invisible(onInvisible) {
            OnInvisible = onInvisible
        },
        unobserve() {
            OnVisible = OnInvisible = Function.prototype
            observer.unobserve(node)
        }
    }
}
let privileged = false

function grant() {
    privileged = true
}

function revoke() {
    privileged = false
}

export function useAudioPrivilege() {
    return [ grant, revoke ]
}

function interceptConstructor<T=any, F=any>(target: F, name: keyof F, construct: (ctor: ConstructorOf<T>, args: any[]) => T) {
    const original = target[name]
    const proxy = new Proxy(original as any, {
        //@ts-ignore
        construct
    })

    target[name] = proxy
}

interceptConstructor<HTMLAudioElement, typeof window>(window, 'Audio', (ctor, args) => {
    if (!privileged) {
        return Object.create(null) as any
    }

    return Reflect.construct(ctor, args)
})

interceptConstructor<HTMLVideoElement, typeof window>(window, 'HTMLVideoElement', (ctor, args) => {
    if (!privileged) {
        return Object.create(null) as any
    }

    return Reflect.construct(ctor, args)
})

interceptConstructor<HTMLIFrameElement, typeof window>(window, 'HTMLIFrameElement', (ctor, args) => {
    if (!privileged) {
        return Object.create(null) as any
    }

    return Reflect.construct(ctor, args)
})

const preventedTags = ['audio', 'video', 'iframe']

new MutationObserver(muts => {
    for (const mut of muts) {
        mut.addedNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return
            }

            const element = node as HTMLElement
            if (preventedTags.includes(element.tagName.toLowerCase())) {
                // element.setAttribute('muted', 'true')
                element.remove()
            }
        })
    }
}).observe(document.body, { childList: true, subtree: true })
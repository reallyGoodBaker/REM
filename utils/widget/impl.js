const
    cache = new Map(),
    reqMap = new Map()

async function fetchResText(src) {
    let _fetch

    if (reqMap.has(src)) {
        _fetch = reqMap.get(src)
    } else {
        reqMap.set(src, _fetch = fetch(src))
    }

    return await (await _fetch).clone().text()
}

async function getHTMLString(src) {
    let returnVal

    if(cache.has(src)) {
        returnVal = cache.get(src)
    } else {
        returnVal = await fetchResText(src)
        cache.set(src, returnVal)
        reqMap.delete(src)
    }
    
    return returnVal
}

export class ViewImplementor extends HTMLElement {

    constructor(templateHTML) {
        super()
        this.style.display = 'none'
        this.init(templateHTML)
    }

    async init(src) {
        const templateString = await getHTMLString(src)
        const shadow = this.attachShadow({mode: 'open'})

        shadow.innerHTML = templateString

        this.onViewImpl(shadow)
        this.removeAttribute('style')
    }

    /**
     * @override 
     * @param {ShadowRoot} shadowRoot
     */
    onViewImpl(shadowRoot) {
        throw 'Did not override method "onViewImpl"'
    }

}

customElements.define('r-view', ViewImplementor)
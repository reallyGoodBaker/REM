class EventListenerStore {
    map = new Map()

    #addMapping(element) {
        this.map.set(element, {})
    }

    add(element, eventType, listener) {
        if (!this.map.has(element)) {
            this.#addMapping(element)
        }

        const mappings = this.map.get(element)

        if (!Reflect.has(mappings, eventType))
            mappings[eventType] = new Set([ listener ])
        else
            mappings[eventType].add(listener)
    }

    remove(element, eventType, listener) {
        if (!this.map.has(element)) {
            return
        }

        const mappings = this.map.get(element)

        if (Reflect.has(mappings, eventType))
            mappings[eventType].delete(listener)
    }

    eventListeners(element) {
        return this.map.get(element) || {}
    }
}

const globalListenerStore = new EventListenerStore()

export function addListener(raw) {
    return function(type, handler, ...other) {
        globalListenerStore.add(this, type, handler)
        raw.call(this, type, handler, ...other)
    }
}

export function removeListener(raw) {
    return function(type, handler, ...other) {
        globalListenerStore.remove(this, type, handler)
        raw.call(this, type, handler, ...other)
    }
}

/**
 * inject
 * @param {HTMLElement} element 
 * @returns 
 */
export function globalGetEventListeners(element) {
    return globalListenerStore.eventListeners(element)
}

/**
 * intercept
 * @returns 
 */
export function eventListeners() {
    return function() {
        return globalListenerStore.eventListeners(this)
    }
}
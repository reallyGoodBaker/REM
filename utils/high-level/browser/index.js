import { addListener, eventListeners, globalGetEventListeners, removeListener } from "./html-element"
import { inject, intercept } from "./inject"
import { promiseResolvers } from "./promise"

export function initHighLevelApi() {
    inject(globalThis.Promise, {
        // TC39 stage3 `Promise.withResolvers`
        withResolvers: promiseResolvers.bind(undefined)
    })

    // getEventListeners
    intercept(HTMLElement.prototype, 'addEventListener', addListener)
    intercept(HTMLElement.prototype, 'removeEventListener', removeListener)
    intercept(HTMLElement.prototype, 'eventListeners', eventListeners)
    inject(globalThis, {
        getEventListeners: globalGetEventListeners
    })
}
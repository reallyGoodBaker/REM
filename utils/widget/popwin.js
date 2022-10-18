import {WillCreateLayerWidget} from './layer.js'

function isFunction(what) {
    return typeof what === 'function'
}

export class PopWindowWidget extends WillCreateLayerWidget {

    isPoped = false

    constructor() {
        super()
        this.style.display = 'none'
        this.addEventListener('click', ev => ev.stopPropagation())
    }

    /**@protected*/ hide() {
        if (!this.isPoped) return
        this.disableLayer()
        this.animate([
            {opacity: 1, transform: 'translate(-50%, -50%) scale(1)'},
            {opacity: 0, transform: 'translate(-50%, -50%) scale(0.94)'},
        ], 100).onfinish = () => {
            this.style.display = 'none'
            this.isPoped = false
            if (isFunction(this.onhide)) {
                this.onhide.call(this)
            }
        }
    }

    display(showLayer) {
        if (this.isPoped) return
        if(showLayer) this.showLayer()
        this.style.display = 'block'
        this.style.pointerEvents = 'none'
        this.animate([
            {opacity: 0, transform: 'translate(-50%, calc(-50% + 12px))'},
            {opacity: 1, transform: 'translate(-50%, -50%)'},
        ], 100).onfinish = () => {
            this.style.pointerEvents = 'all'
            this.isPoped = true
            if (isFunction(this.ondisplay)) {
                this.ondisplay.call(this)
            }
        }
    }

}
import { Widget, injectService } from './base.js'

class PopupConfig {
    vertical = 'center'
    horizontal = 'center'
    verticalFrom = 'bottom'
    horizontalFrom = 'none'
}

const defaultPopupConfig = new PopupConfig()

export class PopWidget extends Widget {

    isPoped = false

    constructor() {
        super()

        this.style.position = 'absolute'
        this.style.display = 'none'
    }

    /**
     * @param {PopupConfig} popupConfig 
     */
    popup(popupConfig) {
        const {vertical, verticalFrom, horizontal, horizontalFrom} = Object.assign(defaultPopupConfig, popupConfig)

        const offsetY = verticalFrom === 'top' ? -16
            : verticalFrom === 'bottom'? 16 : 0

        const offsetX = horizontalFrom === 'left' ? -16
            : horizontalFrom === 'right'? 16 : 0

        const rect = this.getBoundingClientRect()

        switch (horizontal) {
            case 'left':
                this.style.left = '8px'
                break
        
            case 'right':
                this.style.right = '24px'
                break

            default:
                this.style.left = (visualViewport.width - rect.width)/2 + 'px'
                break
        }


        switch (vertical) {
            case 'top':
                this.style.top = '58px'
                break
        
            case 'bottom':
                this.style.bottom = '78px'
                break

            default:
                this.style.left = (visualViewport.height - rect.height)/2 + 'px'
                break
        }

        this.style.display = 'block'

        this.animate([
            {opacity: 0, transform: `translate(${offsetX}px, ${offsetY}px)`},
            {opacity: 1, transform: 'translate(0, 0)'},
        ], 100).onfinish = () => {
            this.isPoped = true
        }
    }

    fade() {
        this.animate([
            {opacity: 1, transform: 'scale(1)'},
            {opacity: 0, transform: 'scale(0.94)'},
        ], 100).onfinish = () => {
            this.style.display = 'none'
            this.isPoped = false
            this.onFaded.call(this)
        }
    }

    /**
     * @param {Node} node 
     */
    setContent(node) {
        this.appendChild(node)
        return this
    }

    onPopup() {}
    onFaded() {}

}


injectService.add(PopWidget)
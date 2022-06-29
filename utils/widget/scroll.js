import {Widget, injectService} from './base.js'

export class ScrollWidget extends Widget {
    constructor(orientation='vertical') {
        super()

        this.classList.add('scrollable', orientation)

        this.orientation = orientation
    }
}

injectService.add(ScrollWidget)
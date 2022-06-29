import {Widget, injectService} from '../widget/base.js'

export class ProgressWidget extends Widget {
    constructor() {
        super()

        this.bar = document.createElement('div')

        this.classList.add('progress')
        this.bar.classList.add('progress-bar')
    }

    get value() {
        return this.bar.offsetWidth / this.offsetWidth
    }

    set value(val) {
        this.bar.style.width = Math.min(Math.max(val, 0), 1) * this.offsetWidth + 'px'
    }
}

injectService.add(ProgressWidget)
import {Widget, injectService} from '../widget/base.js'
import {PopWindowWidget} from '../widget/popwin.js'
import {ScrollWidget} from '../widget/scroll.js'

function button(text) {
    const btn = document.createElement('div')
    btn.innerText = text
    btn.classList.add('btn', 'radius', 'px4', 'margin')
    btn.style.display = 'none'
    return btn
}

export class WizardContainer extends PopWindowWidget {
    constructor() {
        super()

        this.style.cssText = 'width: 420px;'
            + 'pointer-events: all;'
            + 'display: none;'
            + 'height: 560px;'
            + 'max-height: 88%;'
            + 'border-radius: 12px;'
            + 'box-shadow: 0px 8px 12px rgba(0,0,0,0.32);'
            + 'overflow: hidden;'
            + 'background-color: var(--controlBackground);'
            + 'position: absolute;'
            + 'top: 50%; left: 50%; transform: translate(-50%, -50%);'

        const progress = document.createElement('progress'),
            content = document.createElement('div'),
            btnGroup1 = document.createElement('div'),
            btnGroup2 = document.createElement('div'),
            next = button('下一步'),
            prev = button('上一步'),
            cancel = button('取消')


        this.progress = progress
        this.content = content
        this.next = next
        this.prev = prev
        this.cancel = cancel

        progress.value = 0
        progress.classList.add('horizontal')

        content.style.cssText = 'width: 100%; height: fit-content; min-height: 488px;'

        prev.classList.add('bright')
        next.classList.add('accent')
        cancel.classList.add('light')
        
        btnGroup2.appendChild(prev)
        btnGroup2.appendChild(next)

        btnGroup1.appendChild(cancel)
        btnGroup1.appendChild(btnGroup2)

        btnGroup1.classList.add('Row')
        btnGroup2.classList.add('Row')
        btnGroup1.style.justifyContent = 'space-between'
        btnGroup1.style.backgroundColor = 'var(--controlBrighter)'
        btnGroup1.style.padding = '12px'

        this.appendChild(progress)
        this.appendChild(content)
        this.appendChild(btnGroup1)

        cancel.addEventListener('click', () => this.hide())

    }

    addContent(...children) {
        for (const child of children) {
            this.content.appendChild(child)
        }
    }

    setButtonsDisplay(displayInfo) {
        const next = !!(displayInfo & 1),
            prev = !!(displayInfo & 2),
            cancel = !!(displayInfo & 4)

        this.next.style.display = next
            ? ''
            : 'none'

        this.prev.style.display = prev
            ? ''
            : 'none'

        this.cancel.style.display = cancel
            ? ''
            : 'none'
    }

    setProgress(val) {
        this.progress.value = val
    }

}

export class ButtonDisplay {
    static NEXT = 1
    static PREV = 2
    static CANCEL = 4
}

export class WizardContentPage extends ScrollWidget {
    
}

export const defaultWizard = injectService.getInstance(WizardContainer)
import { injectService } from '../base.js'
import { PopWidget } from '../popwidget.js'
import { ViewImplementor } from '../impl.js'

class NotificationContent extends ViewImplementor {
    icon = null
    msg = null

    constructor(container) {
        super('../../utils/widget/notification/view.html')
        this.outerContainer = container
    }

    /**
     * @param {ShadowRoot} root 
     */
    onViewImpl(root) {
        const icon = root.getElementById('icon'),
            msg = root.getElementById('msg'),
            close = root.getElementById('close')

        this.icon = icon
        this.msg = msg

        close.addEventListener('click', () => {
            this.outerContainer.fade()
        })
    }

    setIcon(url) {
        if (this.icon) {
            this.icon.innerText = url
        }
    }

    setMessage(msg) {
        if (this.msg) {
            this.msg.innerText = msg
        }
    }
}
customElements.define('pop-widgetcontent', NotificationContent)

export class NotificationWidget extends PopWidget {

    constructor() {
        super()

        this.style.pointerEvents = 'all'
        this.setContent(this.notifContent = new NotificationContent(this))
    }

    setIcon(url) {
        this.notifContent.setIcon(url)
        return this
    }

    setMessage(text) {
        this.notifContent.setMessage(text)
        return this
    }

}

injectService.add(NotificationWidget)
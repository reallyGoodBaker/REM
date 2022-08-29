import { injectService } from '../base.js'
import { PopWidget } from '../popwidget.js'
import { ViewImplementor } from '../impl.js'

class NotificationContent extends ViewImplementor {
    icon = ''
    msg = 'Notification'

    constructor(container) {
        super('./utils/widget/notification/view.html')
        this.outerContainer = container
    }

    /**
     * @param {ShadowRoot} root 
     */
    onViewImpl(root) {
        const icon = root.getElementById('icon'),
            msg = root.getElementById('msg'),
            close = root.getElementById('close')

        const _icon = this.icon,
            _msg = this.msg

        Object.defineProperties(this, {
            icon: {
                set(v) {
                    icon.innerText = v
                }
            },

            msg: {
                set(v) {
                    msg.innerText = v
                }
            }
        })

        this.icon = _icon
        this.msg = _msg

        close.addEventListener('click', () => {
            this.outerContainer.fade()
        })
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
        this.notifContent.icon = url
        return this
    }

    setMessage(text) {
        this.notifContent.msg = text
        return this
    }

}

injectService.add(NotificationWidget)
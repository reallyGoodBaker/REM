let uid = 0

function generateUid() {
    return uid++
}

const _isWidgetClass = Symbol()


class InjectWidgetService {
    /**@private*/ _store = new Map()

    add(constructable) {
        if (constructable[_isWidgetClass]) {
            const uid = generateUid()
            this._store.set(constructable, uid)
            customElements.define(`uid-${uid}`, constructable)
        }
    }

    getInstance(constructable, ...args) {
        const store = this._store
        if (!store.has(constructable)) {
            this.add(constructable)
        }

        return Reflect.construct(
            constructable,
            args
        )
    }

    inject(constructable, parent, ...args) {
        if (parent instanceof Node) {
            const instance = this.getInstance(constructable, ...args)
            parent.appendChild(instance)
            return instance
        }

        return null
    }
}

export class Widget extends HTMLElement {
    static [_isWidgetClass] = {}

    inject(node) {
        if (node instanceof Node) {
            node.appendChild(this)
        }
    }
}

export const injectService = new InjectWidgetService()
export default Widget
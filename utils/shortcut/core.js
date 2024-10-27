/**
 * @enum {number}
 */
export const ShortcutKey = {
    Ctrl: 1,
    Alt: 2,
    Shift: 4,
    Meta: 8
}

const shortcuts = new Set()

export function regShortcut(key, flag=0, handler=Function.prototype) {
    if (typeof flag === 'number') {
        shortcuts.add({ key, flag, handler })
    }
}

export function unregShortcut(key, flag=0) {
    const shortcut = Array(...shortcuts.values()).find(v => v.key === key && v.flag === flag)

    if (shortcut) {
        shortcuts.delete(shortcut)
    }
}

window.addEventListener('keydown', ev => {
    for (const { key, flag, handler } of shortcuts) {
        if (ev.key !== key) {
            continue
        }

        if (!(flag & ShortcutKey.Ctrl) === ev.ctrlKey) {
            continue
        }

        if (!(flag & ShortcutKey.Alt) === ev.altKey) {
            continue
        }

        if (!(flag & ShortcutKey.Shift) === ev.shiftKey) {
            continue
        }

        if (!(flag & ShortcutKey.Meta) === ev.metaKey) {
            continue
        }

        ev.preventDefault()
        handler()
    }
})

function parseKeyset(keyset) {
    const keys = keyset.split('+')
    let flag = 0
    let key = ''

    for (const _key of keys) {
        switch (_key) {
            case 'Ctrl': flag |= ShortcutKey.Ctrl; continue
            case 'Alt': flag |= ShortcutKey.Alt; continue
            case 'Shift': flag |= ShortcutKey.Shift; continue
            case 'Meta': flag |= ShortcutKey.Meta; continue
        }

        key = _key
    }

    return [ key, flag ]
}

export function registerShortcut(keyset, handler) {
    const [ key, flag ] = parseKeyset(keyset)
    regShortcut(key, flag, handler)
}

export function unregisterShortcut(keyset) {
    const [ key, flag ] = parseKeyset(keyset)
    unregShortcut(key, flag)
}
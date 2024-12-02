/**
 * @enum {number}
 */
export const ShortcutKey = {
    Ctrl: 1,
    Alt: 2,
    Shift: 4,
    Meta: 8,
}

/**
 * @type {Set<{key: string, flag: number, handler: Function, id: string}>}
 */
const shortcuts = new Set()
export const shortcutsProxy = () => Array.from(shortcuts)

export function regShortcut(id, key, flag=0, handler=Function.prototype) {
    if (typeof flag === 'number') {
        shortcuts.add({ key, flag, handler, id })
    }
}

export function unregShortcut(id) {
    const shortcut = getShortcut(id)

    if (shortcut) {
        shortcuts.delete(shortcut)
    }
}

/**
 * @typedef Keyset
 * @property {string} key
 * @property {number} flag
 */

/**
 * @param {string|Keyset} id 
 * @returns 
 */
export function getShortcut(id) {
    if (typeof id === 'string') {
        return Array(...shortcuts.values()).find(v => v.id === id)
    }

    return Array(...shortcuts.values()).find(v => v.key === key && v.flag === flag)
}

let recordMode = false
/**
 * @type {null|Keyset}
 */
let recordedKeyset = null

export function useRecordMode() {
    recordMode = true

    return {
        getKeyset: () => recordedKeyset,
        depose: () => {
            recordMode = false
            recordedKeyset = null
        }
    }
}

const ignores = [
    'ControlLeft',
    'ControlRight',
    'AltLeft',
    'AltRight',
    'ShiftLeft',
    'ShiftRight',
    'MetaLeft',
    'MetaRight',
]

window.addEventListener('keydown', ev => {
    if (recordMode) {
        if (ignores.includes(ev.code)) {
            return ev.preventDefault()
        }

        let flag = 0
        if (ev.ctrlKey) 
            flag |= ShortcutKey.Ctrl
        if (ev.altKey) 
            flag |= ShortcutKey.Alt
        if (ev.shiftKey) 
            flag |= ShortcutKey.Shift
        if (ev.metaKey) 
            flag |= ShortcutKey.Meta

        recordedKeyset = {
            key: ev.code,
            flag,
        }

        return ev.preventDefault()
    }

    for (const { key, flag, handler } of shortcuts) {
        if (ev.code !== key) {
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

export function parseKeyset(keyset) {
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

export function registerShortcut(id, keyset, handler) {
    const [ key, flag ] = parseKeyset(keyset)
    regShortcut(id, key, flag, handler)
}

export function unregisterShortcut(id) {
    unregShortcut(id)
}

export function keyset2str(key, flag, saveMode=false) {
    if (!key) {
        return langMapping.s('unset')
    }

    let keys = []

    if (flag & ShortcutKey.Ctrl) {
        keys.push('Ctrl')
    }

    if (flag & ShortcutKey.Alt) {
        keys.push('Alt')
    }

    if (flag & ShortcutKey.Shift) {
        keys.push('Shift')
    }

    if (flag & ShortcutKey.Meta) {
        keys.push('Meta')
    }

    keys.push(key)
    return keys.join(saveMode ? '+' : ' + ')
}
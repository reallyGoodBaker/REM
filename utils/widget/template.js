/**
 * @param {string} str 
 * @returns 
 */
function StringLike(str) {
    return {
        toString: () => str
    }
}

const _handlers = Symbol('handler')
    ,_ref = Symbol('ref')

/**
 * @param {string[]} strs 
 * @param {any[]} args 
 * @returns
 */
export function template(strs, ...args) {
    let templateStr = ''
    let handlersMap = {}
    let refMap = {}

    templateStr = strs.reduce((pre, cur, i) => {
        i--

        const val = args[i]
        if (!val) {
            return pre + cur
        }

        if (Array.isArray(val)) {
            const arrStr = val.reduce((pre, cur) => {
                if (cur.toString && cur[_handlers]) {
                    handlersMap = Object.assign(handlersMap, cur[_handlers])
                }

                if (cur.toString && cur[_ref]) {
                    refMap = Object.assign(refMap, cur[_ref])
                }

                return pre + cur
            }, '')

            return pre + arrStr + cur
        }

        if (val.toString && val[_handlers]) {
            handlersMap = Object.assign(handlersMap, val[_handlers])
            return pre + val + cur
        }

        if (val.toString && val[_ref]) {
            refMap = Object.assign(refMap, val[_ref])
            return pre + val + cur
        }

        if (typeof val === 'function') {
            const uuid = crypto.randomUUID()
            handlersMap[uuid] = val
            return pre + uuid + cur
        }

        return pre + val + cur
        
    }, '')

    const strObj = StringLike(templateStr)
    strObj[_handlers] = handlersMap
    strObj[_ref] = refMap

    return strObj
}

/**
 * @param {HTMLElement} ele 
 * @param {{toString: () => string}} template 
 * @returns 
 */
export function use(ele, template) {
    ele.innerHTML = template

    if (template[_handlers]) {
        bindEvents(ele, template[_handlers])
    }

    if (template[_ref]) {
        bindValues(ele, template[_ref])
    }
}

/**
 * @param {HTMLElement} root 
 * @param {(el: HTMLElement) => void} callback 
 */
function traverse(root, callback) {
    [...root.children].forEach(el => {
        callback.call(root, el)
        traverse(el, callback)
    })
}

/**
 * @param {HTMLElements} ele
 */
function bindEvents(ele, map) {
    traverse(ele, ele => {
        const keys = Reflect.ownKeys(ele.attributes).filter(k => k.startsWith('on:'))

        for (const k of keys) {
            const uuid = ele.getAttribute(k)
            if (!uuid) {
                continue
            }

            const [_, evName] = k.split(':')
            ele.addEventListener(evName, map[uuid])
            ele.removeAttribute(k)
        }
    })
}


function refCallbackWrapper(func, ele) {
    return async v => {
        const val = await func.call(ele, v, ele)

        return {ele, val}
    }
}

/**
 * @typedef Ref
 * @prop {() => string} toString
 * @prop {any} init
 * @prop {any} value
 */

const refMapGlobal = {}
/**
 * @param {HTMLElements} ele
 */
function bindValues(ele, map) {
    traverse(ele, ele => {
        const uuid = ele.getAttribute('$ref')

        if (!uuid) {
            return
        }

        refMapGlobal[uuid] = refCallbackWrapper(map[uuid], ele)

        ele.removeAttribute('$ref')
    })
}

const RawData = v => v

/**
 * @param {any} initVal 
 * @returns
 */
export function val(initVal='') {
    return ref(RawData, initVal)
}

const _refUuid = Symbol('refUUID')

/**
 * @param {(v: any, el: HTMLElement) => Promise<{toString: () => string}> | ({toString: () => string})} updater 
 * @param {string} initVal 
 * @returns {Ref}
 */
export function ref(updater, initVal='') {
    initVal += ''

    const refUuid = crypto.randomUUID()
    let valEleTemp = {
        toString: () => `<div $ref="${refUuid}" style="display: contents">${initVal}</div>`
    }
    let ref = {[refUuid]: updater}

    valEleTemp[_ref] = ref
    valEleTemp[_refUuid] = refUuid
    return new Proxy(valEleTemp, {
        get(t, p) {
            if (p === 'init') {
                return initVal
            }

            return t[p]
        },

        set(t, p, v) {
            if (p === 'value') {
                update(t, v)
                return true
            }

            return false
        }
    })
}

/**
 * @param {Ref} ref 
 * @param {any} value 
 * @returns {void}
 */
export async function update(ref, value) {
    const handler = refMapGlobal[ref[_refUuid]]

    if (!handler) {
        return
    }

    const {ele, val} = await handler.call(undefined, value)
    ele.innerText = val
}
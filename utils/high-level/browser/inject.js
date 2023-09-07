/**
 * @param {any} position
 * @param {any} values 
 */
export function inject(position, values) {
    Reflect.ownKeys(values).forEach(k => {
        const value = values[k]

        position[k] = value
    })
}

/**
 * @type {<T> (obj: T, prop: keyof T, handler: Function) => Function}
 */
export function intercept(obj, prop, handler) {
    const original = obj[prop]
    const modified = handler.call(null, original)

    obj[prop] = modified

    return original
}
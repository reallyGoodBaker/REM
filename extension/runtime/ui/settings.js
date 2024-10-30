let counter = 0

export const ToggleField = (label='toggle', defaultValue=false, name=`${counter++}`) => {
    return {
        type: 'boolean',
        name,
        label,
        defaultValue,
    }
}

export const TextField = (label='text', defaultValue='', name=`${counter++}`) => {
    return {
        type: 'string',
        name,
        label,
        defaultValue,
    }
}

export const NumberField = (label='number', defaultValue=0, min=0, max=1, name=`${counter++}`) => {
    return {
        type: 'number',
        name,
        label,
        min,
        max,
        defaultValue,
    }
}

export const fromObject = (obj, i18n={}) => {
    return Object.entries(obj).map(([ key, value ]) => {
        if (typeof value === 'string') {
            return TextField(i18n[key] || key, value, key)
        }

        if (typeof value === 'boolean') {
            return ToggleField(i18n[key] || key, value, key)
        }

        if (typeof value === 'number') {
            return NumberField(i18n[key] || key, value, -Infinity, Infinity, key)
        }

        if (typeof value === 'object') {
            const { value, min, max } = value
            return NumberField(i18n[key] || key, value, min ?? -Infinity, max ?? Infinity, key)
        }
    })
}
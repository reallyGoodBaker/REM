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
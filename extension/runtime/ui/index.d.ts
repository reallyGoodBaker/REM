export function ToggleField(
    label?: string,
    defaultValue?: boolean,
    name?: string
): BooleanUIElement

export function TextField(
    label?: string,
    defaultValue?: string,
    name?: string
): BooleanUIElement

export function NumberField(
    label?: string,
    defaultValue?: number,
    min?: number,
    max?: number,
    name?: string
): BooleanUIElement

export function fromObject(obj: any, i18n?: any): UIElement[]
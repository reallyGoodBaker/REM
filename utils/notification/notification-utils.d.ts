type Control = {
    icon: string
    label: string
    onClick: () => void
}

export const notify: (notification: {
    title: string
    message?: string
    icon?: string
    timeout?: number
    channel?: string
    controls?: Control[]
    onCancel?: () => void
    onConfig?: () => void
}) => void
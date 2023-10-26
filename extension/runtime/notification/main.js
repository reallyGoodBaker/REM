const {invoke} = require('../main/invoker')

function toCloneableControls(controls) {
    return (controls || []).map(({label, icon}) => ({label, icon}))
}

function toClonableNotification({title, icon, message, timeout, channel, controls}) {
    return {title, icon, message, timeout, channel, controls: toCloneableControls(controls)}
}

function NotNull(func) {
    return typeof func === 'function'
        ? func
        : Function.prototype
}

module.exports = {
    async send(n) {
        const active = await invoke('notification:send', toClonableNotification(n))

        if (active === -1) {
            return NotNull(n.onCancel).call(n), undefined
        }

        if (active === -2) {
            return NotNull(n.onConfig).call(n), undefined
        }

        let btn
        if (!(btn = n.controls[active])) {
            return
        }

        NotNull(btn.onClick).call(btn)
    }
}
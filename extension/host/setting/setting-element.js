import Progress from "../../../pages/components/Progress.svelte"
import SelectListTile from "../../../pages/components/SelectListTile.svelte"
import ToggleListTile from "../components/setting/ToggleListTile.svelte"
import ProgressWithInput from "../../../pages/components/TunnerComponents/ProgressWithInput.svelte"
import InputWithLabel from "../components/setting/InputWithLabel.svelte"

const mapping = {
    select: SelectListTile,
    toggle: ToggleListTile,
    slider: Progress,
    input: InputWithLabel,
    'slider-input': ProgressWithInput,
}

const extensionSettingMapping = new Map()

export function registerCustomSetting(id, desc) {
    if (!Array.isArray(desc)) {
        return
    }

    extensionSettingMapping.set(id, desc.map(({ type, props, listeners }) => {
        return { ctor: mapping[type], props, listeners }
    }))
}

export function getCustomSettings(id) {
    return extensionSettingMapping.get(id)
}
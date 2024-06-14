import Settings from "../../pages/Settings.svelte"
import ExtensionList from '../../extension/ExtensionList.svelte'

function showSettings() {
    Pager.openNew('$settings', Settings, {})
}

function showExtensionsPage() {
    Pager.openNew('$extensions', ExtensionList, {})
}

export const homeOptions = [
    {
        isUrl: false,
        avatar: '\ue8b8',
        title: 'settings',
        onClick: showSettings,
    },
    {
        avatar: '\uf090',
        title: 'download_manager',
        onClick: Function.prototype,
    },
    {
        isUrl: false,
        avatar: '\ue87b',
        title: 'extensions',
        onClick: showExtensionsPage,
    },
]
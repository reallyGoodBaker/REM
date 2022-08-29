import {defaultWizard} from '../wizard.js'
import {AvatarWidget} from '../../widget/avatar.js'

export function init() {
    let profile = store.getSync('profile'),
        avatarUrl = profile.avatarUrl

    const avatar = new AvatarWidget({
        url: avatarUrl
    })

    defaultWizard.setButtonsDisplay(1|2|4)
    defaultWizard.addContent(
        avatar
    )

    return defaultWizard
}
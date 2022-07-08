import {WizardContainer} from '../wizard.js'
import {AvatarWidget} from '../../widget/avatar.js'
import {ScrollWidget} from '../../widget/scroll.js'
import {InputWidget} from '../../widget/input.js'

export const defaultWizard = new WizardContainer()

const col = () => {
    let scroll = new ScrollWidget()
    scroll.classList.add('Column')
    scroll.style.justifyContent = 'center'

    return scroll
}

const head = (txt, lvl=1) => {
    let h2 = document.createElement('h' + lvl)
    h2.innerHTML = txt

    return h2
}

export function init(ele) {
    const profile = store.get('profile')
    const avatar = new AvatarWidget({url: profile.avatarUrl}),
        inputNickname = new InputWidget(),
        header = head('修改你的头像与昵称', 2)
    
    header.style.marginTop = '40px'
    avatar.style.marginTop = '20px'
    inputNickname.style.marginTop = '60px'
    inputNickname.input.value = profile.nickname

    const page1 = col(),
        page2 = col()

    page1.appendChild(header)
    page1.appendChild(avatar)
    page1.appendChild(inputNickname)

    const header2 = head('修改你的介绍', 2)
    header2.style.marginTop = '40px'
    page2.appendChild(header2)
    page2.appendChild(new InputWidget(true))

    defaultWizard.inject(ele)
    defaultWizard.addPage(page1, page2)

    return defaultWizard
}
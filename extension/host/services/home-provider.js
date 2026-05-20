import { rem } from "../../../utils/rem"
import { homeOptions } from "../../../utils/home/browser"
import { getCurrentModule } from "../extension-context"
const options = homeOptions

/**
 * @param {{ isUrl?: boolean; avatar: string, title: string, onClick: () => void }} opt 
 */
function register(opt) {
    opt.extFolder = getCurrentModule().folderName
    options.push(opt)

    rem.emit('refreshHomeOptions')
}

/**
 * @param {{ isUrl?: boolean; avatar: string, title: string, onClick: () => void }} opt 
 */
function unregister(opt) {
    const i = options.indexOf(opt)

    if (i === -1) {
        return
    }

    options.splice(i, 1)
    rem.emit('refreshHomeOptions')
}

export const home = {
    register, unregister
}
import zh_cn from './zh_cn.js'
import en_us from './en_us.js'

export class Lang {
    static langs = {
        zh_cn, en_us
    }

    /**
     * @param {keyof Lang.langs} lang 
     * @param {keyof zh_cn} format 
     * @param  {...any} args 
     * @returns 
     */
    static parse(lang, format, ...args) {

        const langPair = this.langs[lang] || this.langs.zh_cn
        let returnVal = langPair[format]

        args.forEach((val, i) => {
            const str = String(val)
            const index = `$${i + 1}`

            returnVal = returnVal.replace(index, str)
        })

        return returnVal
    }

    static s = this.parse

    lang = 'zh_cn'

    constructor(lang) {
        this.lang = lang || 'zh_cn'
    }

    /**
     * @param {keyof zh_cn} format 
     * @param  {...any} args 
     * @returns 
     */
    parse(format, ...args) {
        return Lang.parse(
            this.lang, format, ...args
        )
    }

    getMapping = () => {
        return Lang.langs[this.lang]
    }

    s = this.parse
}
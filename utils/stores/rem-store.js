const fs = require('fs')
const path = require('path')
const {Data} = require('../appPath/main')
const APPSTORE = path.join(Data, 'store')

if (!fs.existsSync(APPSTORE)) {
    fs.mkdirSync(APPSTORE)
}

const stores = new Map()

function appDataJoin(...paths) {
    return path.join(APPSTORE, ...paths)
}

module.exports = class RemStore {

    get(k) {
        if (stores.has(k)) {
            return stores.get(k)
        }
        
        try {
            let data = fs.readFileSync(appDataJoin(k)).toString()
            stores.set(k, data)
            return data
        } catch (err) {
            // console.error(err)
            return null
        }
    }

    getRaw(k) {
        if (stores.has(k)) {
            return stores.get(k)
        }
        
        try {
            let data = fs.readFileSync(appDataJoin(k))
            stores.set(k, data)
            return data
        } catch (err) {
            // console.error(err)
            return null
        }
    }

    set(k, v) {
        try {
            const splitArr = k.split('/')
            const [folder] = splitArr.length >= 2
                ? splitArr.splice(-2)
                : [null]

            if (folder) {
                const FOLDER = appDataJoin(folder)

                if (!fs.existsSync(FOLDER)) {
                    fs.mkdirSync(FOLDER)
                }
            }

            if (v instanceof ArrayBuffer) {
                v = Buffer.from(v)
            }

            fs.writeFileSync(appDataJoin(k), v)
            stores.set(k, v)
            return true
        } catch (err) {
            // console.log(err);
            return false
        }
    }

    rm(k) {
        const path = appDataJoin(k)
        stores.delete(k)
        
        if (fs.existsSync(path)) {
            fs.rmSync(path)
            return true
        }

        return false
    }
}
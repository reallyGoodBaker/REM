const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../../../path')

function readPath() {
    const paths = fs.readFileSync(filePath).toString().split('\n')
    const [
        AppRoot, Data, AppCache, Downloads, Extensions, ExtVendor
    ] = paths

    fs.rmSync(filePath)

    return {
        paths, AppRoot, Data, AppCache, Downloads, Extensions, ExtVendor
    }
}

module.exports = {
    readPath
}
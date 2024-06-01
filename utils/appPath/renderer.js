const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../../../path')

function readPath() {
    const paths = fs.readFileSync(filePath).toString().split('\n')
    const [
        AppRoot, Logs, Data, AppCache, Downloads, Extensions
    ] = paths

    fs.rmSync(filePath)

    return {
        paths, AppRoot, Data, AppCache, Downloads, Extensions, Logs
    }
}

module.exports = {
    readPath
}
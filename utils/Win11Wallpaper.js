const fs = require('fs')
const http = require('http')
const os = require('os')

const userProfile = process.env.USERPROFILE
const platform = os.platform()
const release = os.release()
    .split('.')[0]

async function getDailyBackgroundUrl() {
    const data = await (
        (await fetch('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'))
            .json()
    )
    return 'https://www.bing.com' + data.images[0].url
}

/**
 * Only for win10 & win11
 * Get your wallpaper binary data
 * @returns {Buffer}
 */
async function getWallpaper() {
    if (platform !== 'win32' && release !== 10) {
        return await getDailyBackgroundUrl()
    }
    return fs.readFileSync(`${userProfile}\\Application Data\\Microsoft\\Windows\\Themes\\TranscodedWallpaper`)
}

/**
 * Only for win10 & win11
 * Create a server for sending image data
 * @param {number} port
 * @param {string} hostname
 * @returns
 */
function server(port=7777, hostname='localhost') {
    return http.createServer((req, res) => {

        const file = getWallpaper()

        res.end(file)
    
    }).listen(port, hostname)
}

module.exports = {
    getWallpaper, server
}
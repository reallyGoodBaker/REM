const fs = require('fs');
const http = require('http');

const userProfile = process.env.USERPROFILE;

/**
 * Only for win10 & win11
 * Get your wallpaper binary data
 * @returns {Buffer}
 */
function getWallpaper() {
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
    
    }).listen(port, hostname);
}

module.exports = {
    getWallpaper, server
}
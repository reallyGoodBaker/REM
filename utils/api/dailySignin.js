const {daily_signin, yunbei_info, yunbei_sign} = require('NeteaseCloudMusicApi')

async function checkIn(cookie) {
    const signed = (await yunbei_info({cookie})).body.mobileSign;
    if (!signed) yunbei_sign({cookie});
    return await daily_signin({cookie});
}

module.exports = {
    checkIn,
}
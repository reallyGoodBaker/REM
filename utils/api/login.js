const {
    login_cellphone,
    login_qr_check,
    login_qr_create,
    login_qr_key,
    login_status,
    logout: lo,
    captcha_sent,
    captcha_verify,
} = require('NeteaseCloudMusicApi')

async function login(phone, captcha) {
    try {
        const res = await login_cellphone({
            phone, captcha
        })
        return res
    } catch (error) {
        return error
    }
}

async function getCaptcha(phone) {
    const captcha = await captcha_sent({ phone })
    return captcha
}

async function verifyCaptcha(phone, captcha) {
    const res = await captcha_verify({
        phone, captcha
    })
    return res
}

async function loginViaQRCode() {
    const key = (await login_qr_key({})).body.data.unikey
    return [key, await login_qr_create({qrimg: true, key})]
}

async function validQRLogin(key) {
    return await login_qr_check({key})
}

async function getUserAccount(cookie) {
    return await login_status({cookie})
}

async function logout() {
    lo()
}

module.exports = {
    login, loginViaQRCode, validQRLogin, getUserAccount, logout, getCaptcha, verifyCaptcha,
}
const {login_cellphone, login_qr_check, login_qr_create, login_qr_key, login_status} = require('NeteaseCloudMusicApi');

async function login(phone, passwd) {
    return await login_cellphone({
        phone, password: passwd
    });
}

async function loginViaQRCode() {
    const key = (await login_qr_key({})).body.data.unikey;
    return [key, await login_qr_create({qrimg: true, key})];
}

async function validQRLogin(key) {
    return await login_qr_check({key});
}

async function getUserAccount(cookie) {
    return await login_status({cookie});
}

module.exports = {
    login, loginViaQRCode, validQRLogin, getUserAccount
}
function json(obj) {
    try {
        return JSON.stringify(obj) ?? 'undefined'
    } catch (error) {
        return String(error)
    }
}

function jsonObj(str) {
    try {
        return JSON.parse(str) ?? undefined
    } catch (error) {
        return error
    }
}

module.exports = {
    json, jsonObj
}
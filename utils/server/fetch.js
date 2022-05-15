const fetch = require('node-fetch')

async function fetchJson(url, init) {
    return await (await fetch(url, init)).json()
}

module.exports = {
    fetchJson
}
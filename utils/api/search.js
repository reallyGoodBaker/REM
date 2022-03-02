const {search, search_hot, search_suggest} = require('NeteaseCloudMusicApi');

async function Search(keywords, type) {
    if(keywords) return await search({keywords, type});
    return await search_hot({});
}

async function suggest(keywords) {
    return await search_suggest({keywords});
} 

module.exports = {Search, suggest};
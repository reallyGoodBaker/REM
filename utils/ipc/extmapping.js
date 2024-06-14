const extensionMapping = new Map()

function record(winId, extensionId) {
    extensionMapping.set(winId, extensionId)
}

function deleteRecord(winId) {
    extensionMapping.delete(winId)
}

function getExtId(winId) {
    return extensionMapping.get(winId)
}

module.exports = {
    record,
    getExtId,
    deleteRecord,
}
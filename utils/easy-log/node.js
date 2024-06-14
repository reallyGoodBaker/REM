const fs = require('fs').promises
const { app } = require('electron')
const { existsSync } = require('fs')
const path = require('path')

function createLogger(file) {
    console.log(file)
    fs.writeFile(file, '')
    return {
        log: async (message) => {
            const time = new Date().toISOString()
            let chunk
            try {
                chunk = JSON.stringify(message)
            } catch (error) {
                chunk = String(message)
            }

            const dirName = path.dirname(file)

            // 创建目录
            if (!existsSync(dirName)) {
                await fs.mkdir(dirName, { recursive: true })
            }

            await fs.appendFile(file, `${time}\n${chunk}\n\n`)
        }
    }
}

const loggers = new Map()

function getLogger(file) {
    let logger = loggers.get(file)
    if (!logger) {
        loggers.set(file, logger = createLogger(file))
    }

    return logger
}

const defaultLogger = getLogger(path.join(app.getPath('logs'), '/default.log'))

module.exports = {
    getLogger, defaultLogger
}
import * as Nedb from 'nedb'
import { app } from 'electron'
import * as path from 'path'

export function db(name: string) {
    return new Nedb({
        autoload: true,
        filename: path.join(app.getPath('userData'), 'db', name)
    })
}
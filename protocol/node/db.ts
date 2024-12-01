import * as Nedb from '@seald-io/nedb'
import { app } from 'electron'
import * as path from 'path'

export type NeDB = Nedb.default

export function db(name: string): NeDB {
    return new (Nedb as any)({
        autoload: true,
        filename: path.join(app.getPath('userData'), 'db', name)
    })
}
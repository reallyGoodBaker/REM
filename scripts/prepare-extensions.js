const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const extensionRoot = path.resolve(__dirname, '../../REM-Extensions')
const sourceRoot = path.join(extensionRoot, 'build')
const targetRoot = path.resolve(__dirname, '../build/builtin-extensions')

const npmCommand = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm'
const npmArgs = process.platform === 'win32'
    ? [ '/d', '/s', '/c', 'npm run build-binaries' ]
    : [ 'run', 'build-binaries' ]

execFileSync(npmCommand, npmArgs, {
    cwd: extensionRoot,
    stdio: 'inherit',
})

if (!fs.existsSync(sourceRoot)) {
    throw new Error(`扩展构建目录不存在: ${sourceRoot}`)
}

fs.rmSync(targetRoot, { recursive: true, force: true })
fs.mkdirSync(targetRoot, { recursive: true })

for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    fs.cpSync(
        path.join(sourceRoot, entry.name),
        path.join(targetRoot, entry.name),
        { recursive: true },
    )
}

console.log(`Prepared built-in extensions: ${targetRoot}`)

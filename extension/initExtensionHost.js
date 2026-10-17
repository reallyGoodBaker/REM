const fs = require('fs')
const path = require('path')
const { Data, Extensions } = require('../utils/appPath/main')

const DataNodeModules = path.join(Data, 'node_modules')
const ExtensionRuntime = path.join(DataNodeModules, 'extension')

function bundledExtensionsRoot() {
    const packagedRoot = path.join(process.resourcesPath, 'builtin-extensions')
    if (fs.existsSync(packagedRoot)) {
        return packagedRoot
    }

    const developmentRoot = path.resolve(__dirname, '../build/builtin-extensions')
    return fs.existsSync(developmentRoot) ? developmentRoot : null
}

function copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true })

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath)
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

function seedBundledExtensions() {
    const sourceRoot = bundledExtensionsRoot()
    if (!sourceRoot) return

    fs.mkdirSync(Extensions, { recursive: true })

    for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue

        const sourcePath = path.join(sourceRoot, entry.name)
        const targetPath = path.join(Extensions, entry.name)
        const manifestPath = path.join(targetPath, 'manifest.json')
        const sourceManifestPath = path.join(sourcePath, 'manifest.json')

        // 内置扩展可能已经存在于用户数据目录。仅判断 manifest 是否存在会
        // 让旧代码永久保留，应用更新后新扩展也不会生效；按扩展版本同步内置文件。
        let shouldSeed = !fs.existsSync(manifestPath)
        if (!shouldSeed && fs.existsSync(sourceManifestPath)) {
            try {
                const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'))
                const targetManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
                shouldSeed = sourceManifest.ver !== targetManifest.ver
            } catch {
                shouldSeed = true
            }
        }

        if (shouldSeed) {
            copyDirectory(sourcePath, targetPath)
        }
    }
}

function cp(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest)
    }

    fs.readdirSync(src).forEach(name => {
        const srcPath = path.join(src, name)
        const destPath = path.join(dest, name)
        const stat = fs.statSync(srcPath)
        if (stat.isFile()) {
            fs.copyFileSync(srcPath, destPath)
            return
        }

        if (stat.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath)
            }

            cp(srcPath, destPath)
        }
    })
}

function initExtRuntime() {
    try {
        if (!fs.existsSync(DataNodeModules)) {
            fs.mkdirSync(DataNodeModules, { recursive: true })
        }

        if (!fs.existsSync(ExtensionRuntime)) {
            fs.mkdirSync(ExtensionRuntime, { recursive: true })
        }

        cp(
            path.resolve(__dirname, '../extension/runtime'),
            ExtensionRuntime
        )

        cp(
            path.resolve(__dirname, '../protocol_dist'),
            path.join(ExtensionRuntime, 'protocol')
        )

        seedBundledExtensions()
    } catch (error) {
        // 用户目录可能被旧进程、杀毒软件或安装器短暂占用；扩展运行时
        // 初始化失败时保留主窗口可用，后续由扩展加载器报告具体扩展错误。
        console.error('[extension] runtime initialization failed:', error)
    }
}

module.exports = {
    initExtRuntime
}

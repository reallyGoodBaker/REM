<script>
import Nav from './components/Nav.svelte'
import Control from './components/Control.svelte'
import Pager from './Pager.svelte'
import Mine from './Mine.svelte'
import Explorer from './Explorer.svelte'
import Appbar from './components/Appbar.svelte'
import Login from './Login.svelte'
import SurfaceLayer from './components/SurfaceLayer.svelte';


let MinePage = Mine
if(store.get('profile')) {
    NeteaseApi.checkIn(store.get('cookie'))
} else {
    MinePage = Login
}

let selected = -1
let selections = [
    MinePage, Explorer, 
]

let tabs = [
    '我的',
    '发现',
]

let __pager
window.Pager = (() => {

    let Props = [{}, {}],
        history = [0],
        saves = new Map()
            .set('我的', {})
            .set('发现', {}),
        beforeSwitchHandlers = []


    function add(name, component, props={}, force=false) {
        if(has(name)) {
            if (force) {
                const i = tabs.indexOf(name)
                selections[i] = component
                Props[i] = props
                return false
            } else {
                return true
            }
        }
        selections.push(component)
        tabs.push(name)
        tabs = tabs
        Props.push(props)
        saves.set(name, {})
        return true
    }

    function selectByIndex(index, forceUpdate=false) {
        if (index < 0 || index >= tabs.length) index = 0

        let props = Props[index]
        if(typeof props === 'function') props = props()

        if(selected === index && !forceUpdate) return

        beforeSwitchHandlers.forEach(f => f.call(null))
        beforeSwitchHandlers = []

        history[index] = tabs[selected]
        __pager.display(selections[index], props)

        selected = index
    }

    function select(key, forceUpdate=false) {
        if (typeof key !== 'number') key = tabs.indexOf(key)
        selectByIndex(key, forceUpdate)
    }

    function back() {
        let sel = tabs.indexOf(history[selected])
        !~sel && (sel = 0)

        selectByIndex(sel, true)
    }

    function removeByIndex(index) {
        if (index < 0 || index >= tabs.length) index = 0

        saves.delete(tabs[selected])
        beforeSwitchHandlers = []

        selections = selections
            .slice(0, index)
            .concat(selections.slice(index + 1))

        tabs = tabs
            .slice(0, index)
            .concat(tabs.slice(index + 1))

        let onTabDestroy = typeof Props[index] === 'function'
            ? Props[index]().onTabDestroy
            : Props[index].onTabDestroy
        
        Props = Props
            .slice(0, index)
            .concat(Props.slice(index + 1))

        if(typeof onTabDestroy === 'function') onTabDestroy(index)

        back()
    }

    function remove(key) {
        if (typeof key !== 'number') key = tabs.indexOf(key)
        removeByIndex(key)
    }

    function has(key) {
        if(typeof key === 'string') return ~tabs.indexOf(key)
        return ~selections.indexOf(key)
    }

    function openNew(name, component, props, force=false) {
        if(add(name, component, props, force)) return select(name)

        select(name, true)
    }

    function getContext() {
        const
            contructor = selections[selected],
            name = tabs[selected]
        return {
            name,
            class: contructor,
            props: Props[selected],
            save: saves.get(name)
        }
    }

    function beforeSwitch(handler) {
        beforeSwitchHandlers.push(handler)
    }

    function size() {
        return tabs.length
    }

    function index() {
        return selected
    }

    return {
        add, select, remove, has, openNew,
        getContext, beforeSwitch, size, index,
        removeByIndex: i => {
            if(i > 1) removeByIndex(i)
        },
    }

})()

async function getWallpaperDataSrc() {
    let rawData = await wallpaper.getWallpaper(),
        targetUrl = ''

    if (typeof rawData === 'string') {
        targetUrl = rawData
    } else {
        targetUrl = URL.createObjectURL(new Blob([rawData]))
    }

    return targetUrl
}


let wallpaperImg,
    settings = store.get('sys-settings'),
    useAcrylic = false

async function initBackground() {
    wallpaperImg = await getWallpaperDataSrc()
}

initBackground()


function getBounds() {
    return new Promise((res) => {
        hooks.once('win:bounds', (ev, data) => {
            res(data)
        })
        hooks.send('winquery:bounds')
    })
}

function getScreenSize() {
    return new Promise((res) => {
        hooks.once('win:screenSize', (ev, data) => {
            res(data)
        })
        hooks.send('winquery:screenSize')
    })
}

rem.on('__openMinePage', () => {
    window.Pager.openNew('我的', Mine, {}, true)
})

window.__changeBgPos = changePos


hooks.on('win:screen-move', (ev, x, y) => {
    if (wpEle) {
        wpEle.style.setProperty('--top', y)
        wpEle.style.setProperty('--left', x)
    }
})

hooks.on('win:max', () => changePos(0, 0))
hooks.on('win:unmax', (_, data) => {
    changePos(data[0], data[1])
})

hooks.send('winbind:move')

let wallpaperWidth = 1080, wpEle

function changePos(x,y) {
    if (!useAcrylic) {
        return
    }

    if (wpEle) {
        wpEle.style.setProperty('--top', y)
        wpEle.style.setProperty('--left', x)
    }
}


(async () => {
    let data = await getBounds(),
        ss = await getScreenSize()

    window.Pager.select(0)
    wallpaperWidth = ss.width 
    changePos(data.x, data.y)
})()



//==================================================================

rem.on('playerReady', () => {
    __setColor(document.body, wpEle, 1)
    requestIdleCallback(() => {
        hooks.send('win:show-main')
    })
})

rem.on('changeControlColor', color => {
    document.body.style.setProperty('--controlHue', color)
})

rem.on('useAcrylic', async boolean => {
    settings.theme.useAcrylic = useAcrylic = boolean
    if (boolean) {
        let data = await getBounds()
        changePos(data.x, data.y)
    }
    store.set('sys-settings', settings)
})


//=======================================================================

if (!settings) {
    settings = {
        theme: {
            controlColor: [2, 39, 148, 210, 270, 292, 322],
            useAcrylic: true,
        },
        beta: {
            showDevTools: false
        },

    }

    store.set('sys-settings', settings)
}

let controlColors = settings.theme.controlColor.slice(1)
let controlColorSelected = settings.theme.controlColor[0]



rem.emit('changeControlColor', controlColors[controlColorSelected])
rem.emit('useAcrylic', settings.theme.useAcrylic)


let coloredAppbar = false;
rem.on('__pageFold', () => {
    coloredAppbar = true
});
rem.on('__pageUnfold', () => {
    coloredAppbar = false
});
</script>

<style>
    .window {
        height: 100vh;
        justify-content: flex-start;
        display: grid;
        grid-template-rows: 89px 1fr 72px;
        grid-template-columns: 1fr;
    }

    .wallpaper {
        --top: 0px;
        --left: 0px;
        position: fixed;
        z-index: -999;
        background-color: #000;
        filter: blur(48px);
        transform: translate(calc(var(--left) * -1px), calc(var(--top) * -1px));
        will-change: transform;
    }

    .head {
        z-index: 2;
        background-color: transparent;
        transition: background-color 0.08s;
    }

    .head.noneAcrylic, .head.color.noneAcrylic {
        background-color: var(--controlBackground);
    }

    .head.color {
        backdrop-filter: blur(20px);
        background-color: var(--controlAcrylic);
    }

</style>

<div style="transition: background-color 0.2s; background-color: var({useAcrylic?'--acrylicBackgroundColor':'--noneAcrylicBackgroundColor'});">
    <img class="wallpaper" src={wallpaperImg} alt="" width={wallpaperWidth} bind:this={wpEle}>
    <div class="row window">
        <div class="row head{coloredAppbar? ' color': ''}{useAcrylic?'':' noneAcrylic'}">
            <Appbar/>
            <Nav
                bind:selected
                bind:tabs
            ></Nav>
        </div>
        <Pager bind:this={__pager}/>
        <Control/>
    </div>
    <SurfaceLayer></SurfaceLayer>
</div>
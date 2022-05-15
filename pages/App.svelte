<script>
import Nav from './components/Nav.svelte'
import Control from './components/Control.svelte'
import Pager from './Pager.svelte'

contextMap.set(document.body, {
    '关于': '',
    '检测更新': ''
})

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

    return {
        add, select, remove, has, openNew,
        getContext, beforeSwitch
    }

})()

async function getWallpaperDataSrc() {
    let rawData = await wallpaper.getWallpaper(),
        blob = '',
        len = rawData.length
    
    for(let i = 0; i < len; i++)
        blob += String.fromCharCode(rawData[i])

    return `data:image/jpeg;base64,${btoa(blob)}`
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

appHooks.on('__openMinePage', () => {
    window.Pager.openNew('我的', Mine, {}, true)
})


hooks.on('win:screenMove', (ev, data) => {
    changePos(data.x, data.y)
})


hooks.send('winbind:move')

let wallpaperWidth = 1080, wpEle

function changePos(x,y) {
    if (!useAcrylic) {
        return
    }

    if (wpEle) {
        wpEle.style.setProperty('--top', -y + 'px')
        wpEle.style.setProperty('--left', -x + 'px')
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

appHooks.on('playerReady', () => {
    __setColor(document.body, wpEle, 1)
})

appHooks.on('changeControlColor', color => {
    document.body.style.setProperty('--controlColor', color)
})

appHooks.on('useAcrylic', async boolean => {
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
            controlColor: [0, 'dodgerblue', 'teal', 'darkred', 'gold'],
            useAcrylic: true,
        },

    }

    store.set('sys-settings', settings)
}

let controlColors = settings.theme.controlColor.slice(1)
let controlColorSelected = settings.theme.controlColor[0]



appHooks.emit('changeControlColor', controlColors[controlColorSelected])
appHooks.emit('useAcrylic', settings.theme.useAcrylic)
</script>

<style>
    .window {
        height: calc(100vh - 89px);
        flex-direction: column-reverse;
        justify-content: flex-start;
    }

    .wallpaper {
        --top: 0px;
        --left: 0px;
        --scale: 1;
        position: fixed;
        z-index: -999;
        background-color: #000;
        filter: blur(48px);
        transform: translate(var(--left), var(--top));
        will-change: transfrom;
    }

</style>

<div style="transition: background-color 0.2s; background-color: var({useAcrylic?'--acrylicBackgroundColor':'--noneAcrylicBackgroundColor'});">
    <img class="wallpaper" src={wallpaperImg} alt="" width={wallpaperWidth} bind:this={wpEle}>
    <Appbar/>
    <Nav
        bind:selected
        bind:tabs
    ></Nav>
    <div class="row window">
        <Control/>
        <Pager bind:this={__pager}/>
    </div>
    <SurfaceLayer></SurfaceLayer>
</div>
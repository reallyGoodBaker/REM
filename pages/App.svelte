<script>
import Nav from './components/Nav.svelte'
import Control from './components/Control.svelte'
import Pager from './Pager.svelte'
import Mine from './Mine.svelte'
import Explorer from './Explorer.svelte'
import Appbar from './components/Appbar.svelte'
import Login from './Login.svelte'
import SurfaceLayer from './components/SurfaceLayer.svelte'
import Search from './components/Search.svelte'
import { store } from '../utils/stores/base.js'
import { LifeCycle, rem } from '../utils/rem.js'

let MinePage = Mine
if(store.getSync('profile')) {
    store.get('cookie').then(data => NeteaseApi.checkIn(data))
} else {
    MinePage = Login
}

let selected = -1
let selections = [
    MinePage, Explorer, 
]

let tabs = [
    '#$mine',
    '#$explorer',
]

let searchPlaceholder = ''

let __pager
window.Pager = (() => {

    let Props = [{}, {}],
        saves = new Map()
            .set(tabs[0], {})
            .set(tabs[1], {}),
        beforeSwitchHandlers = [],
        onSearchInput = Function.prototype,
        onSearch = Function.prototype

    function setOnSearchInput(handler) {
        onSearchInput = handler
    }

    function setOnSearch(handler) {
        onSearch = handler
    }

    function setSearchPlaceholder(message) {
        searchPlaceholder = message
    }

    function performSearchInput(str) {
        if (onSearchInput.call) {
            onSearchInput.call(null, str)
        }
    }

    function performSearch(str) {
        if (onSearch.call) {
            onSearch.call(null, str)
        }
    }

    function clearSearchListeners() {
        onSearchInput = Function.prototype
        onSearch = Function.prototype
    }

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
        if(typeof props === 'function') props = props.call(null)

        if(selected === index && !forceUpdate) return

        beforeSwitchHandlers.forEach(f => f.call(null))
        beforeSwitchHandlers = []
        clearSearchListeners()

        __pager.display(
            selections[index],
            props,
        )

        selected = index
    }

    function select(key, forceUpdate=false) {
        if (typeof key !== 'number') key = tabs.indexOf(key)
        selectByIndex(key, forceUpdate)
    }

    function removeByIndex(index) {
        if (tabs[index].startsWith('#')) return
        if (index < 0 || index >= tabs.length) index = 0

        saves.delete(tabs[index])
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

        selectByIndex(index < size() ? index : index - 1, true)
    }

    function remove(key) {
        if (typeof key !== 'number') key = tabs.indexOf(key)
        removeByIndex(key)
    }

    function has(key) {
        if(typeof key === 'string') return ~tabs.indexOf(key)
        return ~selections.indexOf(key)
    }

    async function openNew(name, component, props, force=false) {
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

    function removeCurrent() {
        return removeByIndex(selected)
    }

    function next() {
        const i = index()
        selectByIndex(i < size() - 1 ? i + 1 : 0)
    }

    function prev() {
        const i = index()
        if (i === 0) {
            selectByIndex(size() - 1)
            return
        }

        selectByIndex(i - 1)
    }

    return {
        add, select, remove, has, openNew,
        getContext, beforeSwitch, size, index,
        removeByIndex, removeCurrent,
        setOnSearch, setOnSearchInput, setSearchPlaceholder,
        performSearch, performSearchInput, clearSearchListeners,
        next, prev,
    }

})()


let settings = store.getSync('sys-settings')

rem.on('__openMinePage', () => {
    window.Pager.openNew('#$mine', Mine, {}, true)
})

hooks.on('win:max', Function.prototype)
hooks.on('win:unmax', Function.prototype)


//==================================================================
LifeCycle.when('controlsReady')
    .then(() => window.Pager.select(0))

//=======================================================================

if (!settings) {
    settings = {
        theme: {
            controlColor: [2, 39, 148, 210, 270, 292, 322],
        },
        beta: {
            showDevTools: false
        },
        quality: {
            dataList: ['低', '中', '高', '最佳'],
            selected: 3,
        }
    }

    store.set('sys-settings', settings)
}

let coloredAppbar = false
rem.on('__pageFold', () => {
    coloredAppbar = true
})
rem.on('__pageUnfold', () => {
    coloredAppbar = false
})
</script>

<style>
    .window {
        height: 100vh;
        justify-content: flex-start;
        display: grid;
        grid-template-rows: 89px 1fr 72px;
        grid-template-columns: 1fr;
        backdrop-filter: blur(48px);
        contain: strict;
    }

    .head {
        z-index: 2;
        background-color: transparent;
        transition: background-color 0.08s;
    }

    .head.color {
        backdrop-filter: blur(20px);
        background-color: var(--controlAcrylic);
    }


</style>

<div class="row window" style="background-color: var(--noneAcrylicBackgroundColor);">
    <div class="row head{coloredAppbar? ' color': ''}">
        <div style="width: 100vw; height: 54px; justify-content: center; -webkit-app-region: drag;" class="Row">
            <Search placeholder={searchPlaceholder}/>
        </div>
        <Nav
            bind:selected
            bind:tabs
        ></Nav>
    </div>
    <Pager bind:this={__pager}/>
    <Control/>
</div>
<SurfaceLayer/>
<Appbar/>
<script>

    import Avatar from "./components/Avatar.svelte"
    import SplitList from "./components/SplitList.svelte"
    import { store } from '../utils/stores/base.js'
    import { rem } from '../utils/rem.js'
    import Link from "./components/Link.svelte"

    export let header = null

    const defaultSortFunc = () => 1
    export let listSplitter = store.getSync('playlist/splitter') || {
        location: [0, 4, 44, 72],
        names: ['#', '歌曲名', '艺术家', '专辑'],
    }

    let displayType = store.getSync('playlist/displayType') || 0
    onDestroy(() => {
        store.set('playlist/displayType', displayType)
    })

    listSplitter.sortFunc = [
        defaultSortFunc,
        (a, b) => b.name > a.name || -1,
        (a, b) => b.ar[0].name > a.ar[0].name || -1,
        (a, b) => b.al.name > a.al.name || -1,
    ]

    export let listData = Promise.resolve([])
    export let sortBy = 0
    export let forwards = true

    let splitterContainer

    async function renderList() {
        let data = (await listData)
            .slice()
            .sort(listSplitter.sortFunc[sortBy])
        !forwards && data.reverse()

        return data.map(data => {
            data.al.picUrl = data.al.picUrl ?? header.imgUrl
            return data
        })
    }

    $: _listData = renderList()

    onMount(() => {
        if (listData instanceof Promise) {
            rem.once('pageSwipeAnimFinish', () => listData.then(renderList))
            return
        }

        renderList()
    })


    let click = false
    function loc2width(location) {
        let widths = []
        location.forEach((a, i, arr) => {
            widths.push((arr[i + 1] || 100) - a)
        })
        return widths
    }

    let widths = loc2width(listSplitter.location),
        location = listSplitter.location

    let dragging = false
    let splitWindowWidth = 0, rx = 0, ox = 0, index
    function startSplitDrag(ev, i) {
        click = true
        index = i

        if (index === 0) {
            return
        }
        splitWindowWidth = ev.composedPath()[1].offsetWidth
        dragging = true
        rx = ev.screenX
    }

    function changeSplit(ev) {
        if (dragging) {
            ox = ev.screenX - rx
            if (ox !== 0) {
                click = false
            }
            let per = ox/splitWindowWidth * 100
            location[index] += per
            rx = ev.screenX
            widths = loc2width(location)
        }
    }

    /**
     * @param {MouseEvent} ev
     */
    function endSplitDrag(ev) {
        if (dragging) {
            dragging = false
            rx = ox = 0

            store.set('playlist/splitter', {location, names: listSplitter.names})
        }

        if (click) {
            click = false
            const el = ev.target
            const index = listSplitter.names.indexOf(el.innerText)

            if (index === -1) {
                return
            }

            if (sortBy === index) {
                forwards = !forwards
            }

            sortBy = index

            store.set('playlist/sortBy', sortBy)
            store.set('playlist/forwards', forwards)

            requestIdleCallback(renderList)
        }

    }

    document.addEventListener('mousemove', changeSplit)
    document.addEventListener('mouseup', endSplitDrag)

    let multiMode = false
    document.addEventListener('keydown', ev => {
        if (ev.ctrlKey) {
            multiMode = true
        }
    })
    document.addEventListener('keyup', ev => {
        if (!ev.ctrlKey) {
            multiMode = false
        }
    })

    let selections = new Set()
    function onClick(ev) {
        const i = ev.detail.i
        
        if (multiMode) {
            selections.add(i)
            selections = selections
        } else {
            selections = new Set().add(i)
        }

    }

    import { MainPlaylist } from '../utils/player/playlist.js'
    import { onDestroy, onMount, tick } from "svelte"
    import Artist from "./Artist.svelte"

    async function dbClick(ev) {
        const { listData, i } = ev.detail

        // const matches = MainPlaylist.query({
        //     name: listData[i].name
        // })

        // if (matches.length) {
        //     MainPlaylist.play(matches[0])
        //     return
        // }

        MainPlaylist.loadList(listData)
        MainPlaylist.play(i)
    }

    let container
    onMount(() => {
        contextMap.set(container, {
            '刷新': () => {
                const {name, props} = Pager.getContext()
                const component = Pager.getContext().class

                Pager.openNew(name, component, props, true)
            }
        })
    })

    onDestroy(() => {
        contextMap.delete(container)
    })

    async function playAll() {
        let list = (await listData).slice(0)

        MainPlaylist.loadList(list)
        MainPlaylist.play(0)
    }

    async function playRandom() {
        let list = (await listData).slice(0)

        MainPlaylist.loadList(list.sort(() => {
            return Math.random() - 0.5
        }))
        MainPlaylist.play(0)
    }

    let scrollv, hasRestored = false
    Pager.beforeSwitch(() => {
        if (scrollv?.prepared()) {
            const {save} = Pager.getContext()
            save.offsetRatio = scrollv.getOffsetRatio()
        }
        rem.emit('__pageUnfold')
    })
    async function restoreList() {
        if (scrollv?.prepared()) {
            const {save} = Pager.getContext()
            scrollv.setOffsetRatio(save.offsetRatio)
        }
    }

    async function onSplitListMounted() {
        if (!hasRestored) {
            await tick()
            restoreList()
            hasRestored = true
        }
    }

    onMount(() => Pager.setSearchPlaceholder(`在${header.title}中搜索`))

</script>



<style>
    .header {
        --color: var(--controlBrighter);
        background: linear-gradient(to bottom, transparent 180px, var(--color) 292px, var(--color) 400px);
        width: 292px;
        height: calc(100% - 24px);
        justify-content: flex-start;
        box-sizing: border-box;
        margin: 12px;
        border-radius: 12px;
    }

    .nav {
        padding-bottom: 12px;
        width: 100%;
        height: 32px;
        border-bottom: solid 1px rgba(0,0,0,0.12);
        justify-content: space-between;
        box-sizing: border-box;
    }

    .splitter {
        font-size: small;
        overflow: hidden;
        box-sizing: border-box;
        justify-content: flex-start;
        height: 32px;
        width: 100%;
    }

    .title {
        display: block;
        font-weight: bold;
        margin-bottom: 12px;
    }

    .subtitle {
        display: flex;
        gap: 8px;
        color: var(--controlNight);
    }

    .rowl {
        box-sizing: border-box;
        width: 100%;
        height: calc(100% - 250px);
        padding: 24px;
        justify-content: space-between;
        align-items: flex-start;
        color: var(--controlBlack);
    }

    .splitterTab {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-radius: 4px;
        padding-left: 6px;
        position: relative;
        line-height: 32px;
        height: 32px;
    }

    .splitterTab:hover {
        background-color: rgba(0,0,0,0.1);
    }

    .splitterTab.forwards::after {
        font-family: 'Material Symbols Round';
        content: '\eb95';
        font-size: 16px;
    }

    .splitterTab.backwards::after {
        font-family: 'Material Symbols Round';
        content: '\eb95';
        font-size: 16px;
        transform: scaleX(1.2) rotate(180deg);
    }

    .btn {
        color: var(--controlWhite);
        padding: 10px;
        border: none;
        border-radius: 8px;
        margin-right: 4px;
        font-size: medium;
        text-align: center;
    }

    .btn.big {
        height: 16px;
        font-weight: bold;
        line-height: 16px;
    }

    .accent {
        background-color: var(--controlColor);
    }

    .bright {
        background-color: var(--controlBright);
        color: var(--controlNight)
    }

    .btn:hover {
        filter: brightness(90%);
    }

    .btn:active {
        transform: scale(0.92);
    }

    .bread-crumb {
        position: absolute;
        top: 250px;
        right: 12px;
        font-weight: normal;
        font-size: small;
        background-color: var(--controlDark);
        color: var(--controlWhite);
        padding: 2px 6px;
        border-radius: 6px;
    }

    .playlistContent {
        contain: paint;
        width: calc(100% - 316px);
        height: calc(100% - 12px);
        margin-top: 12px;
        border-radius: 12px 0 0 0;
        background-color: var(--acrylicBackgroundColor);
    }

    .desc {
        margin-top: 40px;
    }
</style>

<div class="Row" style="width: 100%; height: 100%;">
<div class="header Column" style="overflow: hidden; position: relative;">
    <div style="z-index: -1; height: 250px;">
        <Avatar
            width={292}
            height={292}
            radius={'0'}
            avatar={header.imgUrl}
        />
    </div>
    <div class="bread-crumb">{header.trackCount} 首</div>
    <div class="Column rowl">
        <div class="scrollable vertical flex" style="height: 160px;">
            <h3 class="title">{header.title}</h3>
            <div class="subtitle">
                {#each (header.artists ?? []) as ar}
                    <Link text={ar.name} cssText='font-size: normal;' on:click={() => {
                        window.Pager.openNew(ar.name, Artist, ar)
                    }}/>
                {/each}
            </div>
            {#if header.desc}
            <div class="desc">{header.desc}</div>
            {/if}
        </div>

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="Row">
            <div class="btn big accent" on:click={playAll}> {'\ue615'} 播放 </div>
            <div class="btn big bright" on:click={playRandom}>{'\ue619'}</div>
        </div>
    </div>
</div>

<div class="playlistContent">

    <div class="nav">
        <div class="Row splitter"
            style="width: calc(100% - 44px); margin: 0px 24px;"
            bind:this={splitterContainer}
        >
            {#each listSplitter.names as name, i}
            <div on:mousedown={ev => startSplitDrag(ev, i)} class="splitterTab{sortBy===i?!forwards?' forwards': ' backwards': ''}" style="width: {widths[i]}%">{name}</div>
            {/each}
        </div>
    </div>
    
    <div style="height: calc(100% - 32px); ">
        <SplitList
            on:update={onSplitListMounted}
            on:click={onClick}
            on:dbclick={dbClick}
            bind:listData={_listData}
            bind:location
            bind:selections
        ></SplitList>
    </div>

</div>

</div>
<script>

    import Avatar from "./components/Avatar.svelte"
    import SplitList from "./components/SplitList.svelte"
    import Input from "./components/Input.svelte"
    import { store } from '../utils/stores/base.js'
    import { rem } from '../utils/rem.js'
    import Link from "./components/Link.svelte"


    export let header = null;

    const defaultSortFunc = () => 1;
    export let listSplitter = store.getSync('playlist/splitter') || {
        location: [0, 16, 44, 72],
        names: ['#', '歌曲名', '艺术家', '专辑'],
    }

    let displayTypeLabels = ['\ue68e', '\ue600']
    let displayType = store.getSync('playlist/displayType') || 0
    onDestroy(() => {
        store.set('playlist/displayType', displayType)
    })

    listSplitter.sortFunc = [
        defaultSortFunc,
        (a, b) => b.name > a.name || -1,
        (a, b) => b.ar[0].name > a.ar[0].name || -1,
        (a, b) => b.al.name > a.al.name || -1,
    ];

    export let listData = [];
    export let sortBy = 0;
    export let forwards = true;

    let _listData = [], splitterContainer;
    let backup;

    function renderList(data) {
        backup = [...data]
        data.sort(listSplitter.sortFunc[sortBy])
        !forwards && data.reverse()
        _listData = data
    }

    onMount(() => {
        if (listData instanceof Promise) {
            rem.once('pageSwipeAnimFinish', () => listData.then(data => renderList(data)))
            return
        }

        renderList(listData)
    })


    let click = false;

    function sortList(key) {

        if(!click) return false;

        let sortf;
        if(typeof key !== 'number') key = listSplitter.names.indexOf(key);

        if(key === sortBy) {
            forwards = !forwards;
        }

        sortf = listSplitter.sortFunc[key] || defaultSortFunc;
        sortBy = key;

        store.set('playlist/sortBy', sortBy);
        store.set('playlist/forwards', forwards);

        let arr = [...backup];

        arr.sort(sortf);
        if (!forwards) {
            arr = arr.reverse();
        }
        setTimeout(() => {
            _listData = arr
        });

    }

    sortList(sortBy);


    function loc2width(location) {
        let loc = [...location]
        let widths = new Array(location.length).fill(0)
        loc.push(100)
        widths.forEach((el, i, arr) => {
            arr[i] = loc[i+1] - loc[i]
        })

        return widths
    }

    let widths = loc2width(listSplitter.location),
        location = listSplitter.location;

    let dragging = false;
    let splitWindowWidth = 0, raw = 0, rx = 0, ox = 0, index, element;
    function startSplitDrag(ev) {
        click = true;
        element = ev.target;
        if (element === splitterContainer) return;

        index = [...element.parentNode.children].indexOf(element);
        if (index === 0) {
            return
        }
        splitWindowWidth = ev.path[1].offsetWidth;
        dragging = true;
        raw = ev.target.offsetLeft;
        rx = ev.screenX;
    }

    function changeSplit(ev) {
        if (dragging) {
            click = false;
            ox = ev.screenX - rx;
            element.style.transform = `translateX(${ox}px)`;
        }
    }

    document.addEventListener('mousemove', changeSplit);
    document.addEventListener('mouseup', endSplitDrag);

    function endSplitDrag() {
        if (dragging) {
            dragging = false;
            element.style.transform = '';
            let per = ox/splitWindowWidth * 100;
            location[index] += per;
            widths = loc2width(location);

            const d = _listData;
            _listData = [];
            setTimeout(() => {
               _listData = d;
            });

            raw = rx = ox = index = 0;
            element = null;

            store.set('playlist/splitter', {location, names: listSplitter.names});
        }
    }

    let multiMode = false;
    document.addEventListener('keydown', ev => {
        if (ev.ctrlKey) {
            multiMode = true;
        }
    });
    document.addEventListener('keyup', ev => {
        if (ev.ctrlKey) {
            multiMode = false;
        }
    });

    let selections = new Set();
    function onClick(ev) {
        const i = ev.detail.i;
        
        if (multiMode) {
            selections.add(i);
            selections = selections;
        } else {
            selections = new Set().add(i);
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
        MainPlaylist.play(0);
    }

    async function playRandom() {
        let list = (await listData).slice(0)

        MainPlaylist.loadList(list.sort(() => {
            return Math.random() - 0.5
        }))
        MainPlaylist.play(0);
    }

    function ignoreCaseIncludes(src, comp) {
        return src.toLowerCase().includes(comp.toLowerCase())
    }

    async function search(str) {
        if (!str) {
            return []
        }

        const arrayToSearch = (await listData).slice()
        let res = []

        for (const data of arrayToSearch) {
            const {name, al, ar} = data
            if (ignoreCaseIncludes(name, str)) {
                res.push(data)
                continue
            }
            
            if (ignoreCaseIncludes(al.name || '', str)) {
                res.push(data)
                continue
            }

            for (const artist of ar) {
                if (ignoreCaseIncludes(artist.name || '', str)) {
                    res.push(data)
                    break
                }
            }
        }

        return res
    }

    const doSearch = ((func, timeout=600) => {
        let timer
        return (...args) => {
            if (timer) {
                return
            }

            timer = setTimeout(() => {
                func(...args)
                timer = null
            }, timeout);
        }
    })(async str => {
        const res = await search(str)
        if (res.length) {
            renderList(res)
        } else {
            renderList(await listData)
        }
    })


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
        height: 92px;
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
        content: '▲';
        color: var(--controlDarker);
        line-height: 6px;
        font-size: 8px;
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%);
    }

    .splitterTab.backwards::after {
        content: '▼';
        color: var(--controlDarker);
        line-height: 6px;
        font-size: 8px;
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%) scaleX(1.2);
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

    .view-display {
        font-family: "iconfont";
        font-size: medium;
        color: var(--controlBlack);
    }
    .view-display > div {
        margin: 1px;
        padding: 4px;
        cursor: pointer;
        border: solid 2px transparent;
        background-color: transparent;
        border-radius: 4px;
        transition: background-color 0.1s,
            border-color 0.04s;
    }
    .view-display > div:hover {
        border-color: var(--controlBright);
    }
    .view-display > div.selected {
        background-color: var(--controlBrighter);
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

        <div class="Row">
            <div class="btn big accent" on:click={playAll}> {'\ue615'} 播放 </div>
            <div class="btn big bright" on:click={playRandom}>{'\ue619'}</div>
        </div>
    </div>
</div>

<div class="playlistContent">

    <div class="nav">
        <div class="Row" style="margin: 0 24px; height: 60px; align-items: center; justify-content: space-between;">
            <Input
                type="text"
                placeholder={'\ue6a8  搜索列表'}
                fullBorder={true}
                on:input={ev => {
                    doSearch(ev.detail)
                }}/>

            <div class="Row view-display" on:click={ev => {
                    displayType = (+ev.target.getAttribute('index')) ?? displayType
                }}>
                {#each displayTypeLabels as label, i}
                <div index="{i}" class="{displayType === i? 'selected': ''}">{label}</div>
                {/each}
            </div>
        </div>
        <div class="Row splitter"
            style="width: calc(100% - 44px); margin: 0px 24px;"
            bind:this={splitterContainer}
            on:mousedown={startSplitDrag}
        >
            {#each listSplitter.names as name, i}
            <div class="splitterTab{sortBy===i?!forwards?' forwards': ' backwards': ''}" style="width: {widths[i]}%" on:click={() => sortList(i)}>{name}</div>
            {/each}
        </div>
    </div>
    
    <div style="height: calc(100% - 92px); ">
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
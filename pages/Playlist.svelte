<script>

    import Avatar from "./components/Avatar.svelte";
    import ScrollView from "./components/ScrollView.svelte";
    import SplitList from "./components/SplitList.svelte";
    import Input from "./components/Input.svelte";


    export let header = null;

    const defaultSortFunc = () => 1;
    export let listSplitter = store.get('splitter') || {
        location: [2, 8, 30, 70],
        names: ['功能', '歌曲名', '艺术家', '专辑'],

    };

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
            appHooks.once('pageSwipeAnimFinish', () => listData.then(data => renderList(data)))
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

        store.set('sortBy', sortBy);
        store.set('forwards', forwards);

        let arr = [...backup];

        arr.sort(sortf);
        if (!forwards) {
            arr = arr.reverse();
        }
        setTimeout(() => {
            _listData = arr;
        });

        recalcHeight();
    }

    sortList(sortBy);


    function loc2width(location) {
        let loc = [...location];
        let widths = new Array(location.length).fill(0);
        loc.push(100);
        widths.forEach((el, i, arr) => {
            arr[i] = loc[i+1] - loc[i];
        });

        return widths;
    }

    let widths = loc2width(listSplitter.location), location = listSplitter.location;

    let dragging = false;
    let splitWindowWidth = 0, raw = 0, rx = 0, ox = 0, index, element;
    function startSplitDrag(ev) {
        click = true;
        element = ev.target;
        if (element === splitterContainer) return;

        index = [...element.parentNode.children].indexOf(element);
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

            store.set('splitter', {location, names: listSplitter.names});
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

    import {MainPlaylist} from '../utils/player/playlist.js'
    import { onMount } from "svelte";

    async function dbClick(ev) {
        const {listData, i} = ev.detail;

        MainPlaylist.loadList(listData)
        MainPlaylist.play(i);
    }

    let scrollv;
    function recalcHeight() {
        scrollv.measure();
    }

</script>



<style>
    .c {
        justify-content: flex-start;
        width: 100%;
        height: 100%;
        overflow: hidden;

        border-radius: 16px 16px 0px 0px;
    }

    .header {
        --color: transparent;
        background-color: var(--color);
        width: 100%;
        height: 160px;
        min-height: 160px;
        justify-content: flex-start;
        box-sizing: border-box;
        padding: 0px 24px;
        padding-top: 24px;
    }

    .nav {
        width: 100%;
        height: 48px;
        min-height:48px;
        border-bottom: solid 1px rgba(0,0,0,0.12);
        justify-content: space-between;
        flex-direction: row-reverse;
        box-sizing: border-box;
        padding: 0px 24px;
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
        font-size: larger;
        font-weight: bold;
        padding-bottom: 4px;
    }

    .subtitle {
        color: #888;
    }

    .rowl {
        margin-left: 24px;
        align-items: flex-start;
    }

    .ctrls {
        padding: 12px 0px;

    }

    .list {
        box-sizing: border-box;
        align-items: flex-start;
        width: 100%;
        flex-grow: 1;
        flex-shrink: 1;
    }

    .splitterTab {
        position: relative;
        line-height: 32px;
        height: 32px;
    }

    .splitterTab:hover {
        background-color: rgba(0,0,0,0.1);
    }

    .splitterTab.forwards::after {
        content: '▲';
        color: #888;
        line-height: 6px;
        font-size: 8px;
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%);
    }

    .splitterTab.backwards::after {
        content: '▼';
        color: #888;
        line-height: 6px;
        font-size: 8px;
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%);
    }

    .btn {
        border-color: #fff;
        background-color: rgba(255,255,255,0.2);
    }

    .btn:hover {
        background-color: rgba(255,255,255,0.4);
    }

</style>


<ScrollView bind:this={scrollv}>
<div class="row c">

    {#if header}
    <div class="header column">
        <Avatar
            width={140}
            height={140}
            radius={'8%'}
            avatar={header.imgUrl}
        ></Avatar>
        <div class="row rowl">
            <div class="title">{header.title}</div>
            <div class="subtitle">{header.subtitle}</div>

            <div class="column ctrls">
                <div class="btn big outlined"> {'\ue615'} 播放全部 </div>
            </div>

            <div class="subtitle">歌曲 {header.trackCount} &nbsp; 播放 {header.playCount}</div>
        </div>
    </div>
    {/if}

    <div class="nav column">
        <Input type="text" placeholder={'\ue6a8  搜索列表'} fullBorder={true}/>
        <div class="column">
            
        </div>
    </div>

    <div class="column splitter"
        style="padding-left: {location[0]}%"
        bind:this={splitterContainer}
        on:mousedown={startSplitDrag}
    >
        {#each listSplitter.names as name, i}
        <div class="splitterTab{sortBy===i?!forwards?' forwards': ' backwards': ''}" style="width: {widths[i]}%" on:click={() => sortList(i)}>{name}</div>
        {/each}
    </div>

    <div class="row list">
        <SplitList
            on:mount={recalcHeight}
            on:click={onClick}
            on:dbclick={dbClick}
            bind:listData={_listData}
            bind:location
            bind:selections
        ></SplitList>
    </div>
</div>
</ScrollView>
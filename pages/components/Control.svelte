<script>
    import Avatar from "./Avatar.svelte"
    import ProgressInset from "./ProgressInset.svelte"
    import { globalMetadata } from '../../utils/player/metadata.js'
    import { MainPlaylist } from '../../utils/player/playlist.js'
    import { rem, LifeCycle } from '../../utils/rem.js'
    import { store } from '../../utils/stores/base.js'
    import { getColor } from '../../utils/style/imageBasicColor.js'
    import Link from "./Link.svelte"
    import Artist from "../Artist.svelte"
    import { NETEASE_IMG_SMALL } from "../../utils/stores/img.js"
    import { AudioPlayer } from '../../utils/player/player.js'
    import { onMount } from "svelte";
    import { interval } from "../../utils/core/interval";

    let l = langMapping.getMapping()
    rem.on('langChange', lang => {
        l = lang.getMapping()
    })


    let content = {}

    let playing = false
    let duration = 1
    let checker

    globalMetadata.addObserver(function(data) {
        this.apply()
        content = {
            title: data.title(),
            album: data.album().name,
            artwork: [{
                src: data.album().picUrl
            }],
            artist: data.artist(),
        }
    })

    async function setContent(audioData) {
        globalMetadata.title(audioData.title())
        globalMetadata.album(audioData.album().name)
        globalMetadata.artist(audioData.artist().reduce((pre, cur) => [...pre, cur.name], []).join('; '))
        globalMetadata.artwork(0, {
            src: audioData.album().picUrl
        })
        globalMetadata.notifyObservers(audioData)
    }

    let ctx, container

    function setColor() {
        const colorStr = getColor(ctx, 1)
        container.style.setProperty('--color', colorStr)
    }

    function s(stime) {
        let s = ~~(stime%60)
        if (s < 10) {
            s = '0' + s
        }
        return `${~~(stime/60)}:${s}`
    }

    let seekValue = 0
    //==========================================
    const _progressUpdate = () => {
        if (isSeeking) return

        let cur = AudioPlayer.seek()
        seekValue = (cur/duration)*100
        currentTimeEle.innerText = s(cur)

        hooks.send('win:playstate', playing, cur / duration, duration, cur)
    }
    rem.on('setControlsContent', setContent)
    rem.on('loadedContent', () => {
        duration = AudioPlayer.duration()
        durationEle.innerText = s(duration)
        if (checker) {
            seekValue = 0
            checker.cancel()
        }
        checker = interval(_progressUpdate, 200)
    });

    let volume;
    async function restoreVolume() {
        AudioPlayer.volume((volume = await store.get('volume') || 50)/100)
    }

    let playerReady = false
        ,detailReady = false

    rem.on('setControlsContent', () => {
        if (!detailReady) {
            detailReady = true
        }
    })

    LifeCycle.when('playerReady').then(async () => {
        AudioPlayer.on('play', () => playing = true)
        AudioPlayer.on('pause', () => playing = false)
        AudioPlayer.on('ended', () => MainPlaylist.playNext())

        await restoreVolume()

        let listPlaying = await store.get('listPlaying'),
            playIndex = await store.get('listElementPlaying')

        playerReady = true

        if (listPlaying && typeof playIndex === 'number') {
            MainPlaylist.loadList(listPlaying)
            await MainPlaylist.load(playIndex)
        }

        LifeCycle.fire('controlsReady')
        hooks.send('win:show-main')
    })

    async function onClick() {
        if(!(await AudioPlayer.load())) return

        if (playing) {
            return AudioPlayer.pause()
        }

        return AudioPlayer.play()
    }

    window.addEventListener('keypress', ev => {
        if (ev.key === ' ') {
            onClick()
        }
    })

    function playPrev() {
        MainPlaylist.playPrev()
    }

    function playNext() {
        MainPlaylist.playNext()
    }
    
    let singleLoop = false
    let randomPlay = false

    function setPlayType() {
        if (singleLoop) {
            return MainPlaylist.mode = 1
        }
        if (randomPlay) {
            return MainPlaylist.mode = 2
        }
        MainPlaylist.mode = 0
    }

    function setVolume(ev) {
        const vol = +ev.detail
        AudioPlayer.volume(vol/100)
    }


    function saveVolume() {
        store.set('volume', volume)
    }

    var isSeeking = false
    function startSeeking() {
        isSeeking = true
    }

    function endSeek(ev) {
        isSeeking = false
        try {
            AudioPlayer.seek((ev.detail/100)*duration)
        } catch (e) {
            console.log(e)
        }
    }

    function seekMove(ev) {
        if (isSeeking) {
            currentTimeEle.innerText = s((ev.detail/100)*duration)
        }
    }
    
    let currentTimeEle, durationEle

    /**
     * @type {HTMLElement[]}
     */
    var btns = new Array(5)

    onMount(() => {
        LifeCycle.fire('playerReady')
    })
</script>


<style>
    .c {
        --color: #aaa;
        width: 100vw;
        height: 72px;
        background-color: var(--color);
        backdrop-filter: blur(20px);
        justify-content: space-between;
        box-sizing: border-box;
        padding: 0px 24px;
        color: #fff;
        transition: background-color 0.2s;
        z-index: 1;
        text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.4);
    }

    .txt {
        align-items: flex-start;
        margin-left: 24px;
    }

    .header {
        box-sizing: border-box;
    }

    .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        border: solid 2px transparent;
        height: 36px;
        width: 36px;
        text-align: center;
        border-radius: 10px;
        padding: 0px;
        font-weight: normal;
        margin: 0px 8px;
        transition: all 0.1s ease-in-out;
        font-size: medium;
    }

    .btn:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .btn:active {
        background-color: rgba(255, 255, 255, 0.5);
        transform: scale(0.9);
    }

    .btn.active {
        border: solid 2px rgba(255, 255, 255, 0.4);
        background-color: rgba(255, 255, 255, 0.2);
    }

    .btn-big {
        opacity: 0.92;
        background-color: var(--controlColor);
        box-shadow: 0px 0px 2px var(--controlColor);
        transition: all 0.1s;
    }

    .btn-big:hover {
        background-color: var(--controlColor);
        filter: brightness(1.1);
    }

    .btn-big:active {
        background-color: var(--controlColor);
        filter: brightness(0.8);
    }

    .edge {
        width: calc(50% - 152px);
        height: 100%;
        justify-content: flex-start;
        overflow: hidden;
    }

    .center { 
        border: solid 2px transparent;
        width: 300px;
    }

    .btn-nb {
        font-size: small;
        width: 28px;
        height: 28px;
        margin: 0px 4px;
    }
    
    .title {
        font-size: normal;
    }

    .subtitle {
        font-size: small;
        color: #ddd;
        gap: 6px;
    }

    .time {
        margin: 0px 8px;
        font-size: x-small;
    }

    .disable {
        user-select: none;
        pointer-events: none;
        opacity: 0.8;
        filter: brightness(64%);
    }

    .avatar-container {
        position: relative;
        width: fit-content;
        height: fit-content;
    }
    .avatar-container::after {
        content: '\e60a';
        font-family: iconfont;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        color: var(--controlNight);
        background-color: var(--acrylicBackgroundColor);
        backdrop-filter: blur(2px);
        filter: brightness(100%);
        border-radius: 4px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .avatar-container:hover::after {
        opacity: 1;
    }
    .avatar-container:active::after {
        filter: brightness(60%);
    }

</style>


<div class="column c" bind:this={container}>
    {#if playerReady}

    <div class="column header edge">
        {#if detailReady}
        <div class="avatar-container">
            <Avatar
                isUrl={!!content.album}
                avatar={content.artwork? content.artwork[0].src + NETEASE_IMG_SMALL : 'R'}
                width={56}
                height={56}
                radius={'4px'}
                bind:ctx
                on:loaded={setColor}
            />
        </div>
        <div class="row txt">
            <div class="title">{content.title || l['no_song_playing']}</div>
            <div class="Row subtitle">
                {#each content.artist as artist}
                    <Link text={artist.name} on:click={() => window.Pager.openNew(
                        artist.name,
                        Artist,
                        { id: artist.id }
                    )}/>
                {/each}
            </div>
        </div>
        {/if}
    </div>
    

    <div class="row center">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="column" style="margin: 4px 0px;">
            <div class="btn big btn-nb{randomPlay?' active':''}"
                on:click={() => {
                    randomPlay = !randomPlay;
                    setPlayType();
                }}
            >{'\ue619'}</div>
            
            <div class="btn big btn-nb{MainPlaylist.mode? ' disable': ''}"
                on:click={playPrev}
            >{'\ue616'}</div>

            <div class="btn big btn-big"
                on:click={onClick}
            >{!playing? '\ue615': '\ue614'}</div>

            <div class="btn big btn-nb"
                on:click={playNext}
            >{'\ue617'}</div>

            <div class="btn big btn-nb{singleLoop?' active':''}"
                on:click={() => {
                    singleLoop = !singleLoop;
                    setPlayType();
                }}
            >{'\ue618'}</div>
        </div>

        <div class="column" style="width: 100%;">
            <span class="time" bind:this={currentTimeEle}>0:00</span>
            <ProgressInset
                width={200}
                bind:value={seekValue}
                on:mousedown={startSeeking}
                on:mousemove={seekMove}
                on:mouseup={endSeek}
            />
            <span class="time" bind:this={durationEle}>0:00</span>
        </div>
    </div>


    <div class="column edge" style="flex-direction: row-reverse;">
        <ProgressInset
            cssStyle='margin-right: 8px;'
            bind:value={volume}
            on:mousedown={setVolume}
            on:mousemove={setVolume}
            on:mouseup={saveVolume}
        />
        <div class="btn big btn-nb"
            on:click={() => {
                rem.emit('tunnerOpen')
            }}
        >{'\ue61b'}</div>
    </div>

    {/if}
</div>
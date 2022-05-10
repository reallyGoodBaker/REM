<script>
    import Avatar from "./Avatar.svelte";
    import {AudioData} from '../../utils/player/audiodata.js'
    import Progress from "./Progress.svelte";
    import {globalMetadata} from '../../utils/player/metadata.js'
    import {globalPlayer} from '../../utils/player/player.js'
    import {MainPlaylist} from '../../utils/player/playlist.js'


    let content = {};

    let playing = false;
    let duration = 1;
    let checker;

    globalMetadata.addObserver(function(rawMetadata) {
        this.apply();
        content = rawMetadata;
    });

    async function setContent(audioData) {

        globalMetadata.title(audioData.title());
        globalMetadata.album(audioData.album().name);
        globalMetadata.artist(audioData.artist().reduce((pre, cur) => [...pre, cur.name], []).join(' · '));
        globalMetadata.artwork(0, {
            src: audioData.album().picUrl
        });
        globalMetadata.notifyObservers(globalMetadata.getMetadataConfig());

        store.set('loadedContent', audioData.data);
    }

    window.__getColorInfo = function getColorInfo(imgData, w, x, y) {
        let o =  4 * (w*(y-1) + x);
        imgData = imgData.data;
        let data = imgData.slice(o, o+4);
        return data;
    }

    let ctx, container;
    window.__setColor = function __setColor(container, ctx, alpha=0.7) {
        if(!ctx) return;
        /**
         * @type {CanvasRenderingContext2D}
        */
       let cctx = CanvasCtx;
       const w = ctx.width, h = ctx.height;
       Canvas.width = w;
       Canvas.height = h;

       cctx.drawImage(ctx, 0, 0);
       const imageData = cctx.getImageData(0, 0, w, h);

       const w12 = w/2, h12 = h/2, w14 = w/4, w34 = w12 + w14, h14 = h/4, h34 = h12 + h14;
        let lt = __getColorInfo(imageData, w, w14, h14),
        rt = __getColorInfo(imageData, w, w34, h14),
        c = __getColorInfo(imageData, w, w12, h12),
        lb = __getColorInfo(imageData, w, w14, h34),
        rb = __getColorInfo(imageData, w, w34, h34);

        let color = [];

        for (let i = 0; i < 4; i++) {
            let aver = (lt[i] + rt[i] + c[i] + lb[i] + rb[i])/5,
            ratio = 0.0007 * aver + 0.5;
            color[i] = ~~(ratio * aver);
        }

        const colorStr = `rgba(${color[0]},${color[1]},${color[2]}, ${alpha})`;

        container.style.setProperty('--color', colorStr)

        return colorStr;
        
    }

    function setColor() {
        __setColor(container, ctx);
    }

    function s(stime) {
        let s = ~~(stime%60);
        if (s < 10) {
            s = '0' + s;
        }
        return `${~~(stime/60)}:${s}`;
    }

    let seekValue = 0;
    //==========================================
    __emitter.on('setControlsContent', setContent);
    __emitter.on('loadedContent', () => {
        duration = globalPlayer.duration();
        durationEle.innerText = s(duration);
        if (checker) {
            seekValue = 0;
            clearInterval(checker);
        }
        checker = setInterval(() => {
            if (isSeeking) return;

            let cur = globalPlayer.seek();
            seekValue = (cur/duration)*100;
            currentTimeEle.innerText = s(cur);
            //console.log(cur, duration);
        }, 500);
    });

    __emitter.on('playerReady', async p => {
        p.on('play', () => {
            playing = true;
        });
        p.on('pause', () => playing = false);
        p.on('ended', () => MainPlaylist.playNext());

        let c = store.get('loadedContent');
        if (c) {
            c = new AudioData(c);
            setContent(c);
            globalPlayer.loadData(c);
        }

    });

    function onClick() {
        if(!globalPlayer.load()) return;

        if (playing) {
            return globalPlayer.pause();
        }

        return globalPlayer.play();
    }

    window.addEventListener('keypress', ev => {
        if (ev.key === ' ') {
            onClick();
        }
    })

    function playPrev() {
        MainPlaylist.playPrev();
    }

    function playNext() {
        MainPlaylist.playNext();
    }
    
    let singleLoop = false;
    let randomPlay = false;

    function setPlayType() {
        if (singleLoop) {
            return MainPlaylist.mode = 1;
        }
        if (randomPlay) {
            return MainPlaylist.mode = 2;
        }
        MainPlaylist.mode = 0;
    }

    function setVolume(ev) {
        globalPlayer.volume(ev.detail/100);
    }

    let volume;
    if (volume = store.get('volume') || 50) {
        __emitter.once('playerReady', () => {
            globalPlayer.volume(volume/100)
        })
    }

    function saveVolume() {
        store.set('volume', volume);
    }

    var isSeeking = false;
    function startSeeking() {
        isSeeking = true;
    }

    function endSeek(ev) {
        isSeeking = false;
        try {
            globalPlayer.seek((ev.detail/100)*duration);
        } catch (e) {}
    }

    function seekMove(ev) {
        if (isSeeking) {
            currentTimeEle.innerText = s((ev.detail/100)*duration);
        }
    }
    
    var currentTimeEle, durationEle;

    /**
     * @type {HTMLElement[]}
     */
    var btns = new Array(5);

</script>


<style>
    .c {
        --color: #aaa;
        width: 100vw;
        height: 72px;
        background-color: var(--color);
        justify-content: space-between;
        box-sizing: border-box;
        padding: 0px 24px;
        color: #fff;
        transition: background-color 0.2s;
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
    }

    .time {
        margin: 0px 8px;
        font-size: x-small;
    }

</style>


<div class="column c" bind:this={container}>

    <div class="column header edge">
        <Avatar
            isUrl={!!content.album}
            avatar={content.artwork? content.artwork[0].src: 'R'}
            width={56}
            height={56}
            radius={'10%'}
            bind:ctx
            on:loaded={setColor}
        />
        <div class="row txt">
            <div class="title">{content.title || '暂未播放歌曲'}</div>
            <div class="subtitle">{content.artist}</div>
        </div>
    </div>
    

    <div class="row center">
        <div class="column" style="margin: 4px 0px;">
            <div class="btn big btn-nb{randomPlay?' active':''}"
                on:click={() => {
                    randomPlay = !randomPlay;
                    setPlayType();
                }}
            >{'\ue619'}</div>
            
            <div class="btn big btn-nb"
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
            <Progress
                cssStyle="width: 200px"
                bind:value={seekValue}
                on:mousedown={startSeeking}
                on:mousemove={seekMove}
                on:mouseup={endSeek}
            />
            <span class="time" bind:this={durationEle}>0:00</span>
        </div>
    </div>


    <div class="column  edge" style="flex-direction: row-reverse;">
        <Progress
            bind:value={volume}
            on:mousedown={setVolume}
            on:mousemove={setVolume}
            on:mouseup={saveVolume}
        />
    </div>
</div>
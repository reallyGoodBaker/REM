<script>
    import Image from "../pages/components/Image.svelte"
    import LoadingCircle from "../pages/components/LoadingCircle.svelte"
    import ScrollView2 from "../pages/components/ScrollView2.svelte"
    import { getList, getManifest, install, query } from "../utils/ext-market/browser"

    const s = v => langMapping.s(v) || v

    function isUrl(icon) {
        if (!icon) {
            return false
        }

        return icon.endsWith('.png')
    }

    const textMapping = {
        '-1': 'failed',
        0: 'installed',
        1: 'install',
        2: 'update',
    }

    const installing = new Set()

    const installHandler = async (ev, name, status) => {
        if (status < 1) {
            return
        }

        if (installing.has(name)) {
            return
        }

        installing.add(name)
        ev.target.pointerEvents = 'none'
        ev.target.innerText = s('installing')
        const done = await install(name)
        ev.target.pointerEvents = 'all'
        ev.target.innerText = done ? s('installed') : s('error')
        installing.delete(name)
    }
</script>

<style>
    .win {
        width: 100%;
        height: 100%;
    }

    .container {
        width: 520px;
        padding: 10px;
        margin-top: 12px;
        justify-content: space-between;
        align-items: flex-start;
        align-self: center;
    }

    .container:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .disabled {
        pointer-events: none;
        filter: grayscale(0.8);
    }
</style>

<div class="Column win">
    {#await getList()}
        <div class="win-center">
            <LoadingCircle/>
        </div>
    {:then extList}
        <ScrollView2>
            {#each extList as name}
            {#await getManifest(name) then manifest}
            {#await query(manifest) then status}
            <div class="Row container">
                <div class="Row" style="gap: 10px;">
                {#if isUrl(manifest.icon)}
                    <Image
                        alt=''
                        src={manifest.icon}
                        width={32}
                        height={32}
                        borderWidth={0}
                    />
                    {:else}
                        <div style="font-family: 'Material Symbols Round'; font-size: 64px">{manifest.icon || '\ue87b'}</div>
                    {/if}
                    <div style="font-weight: bold; font-size: large">
                        {manifest.name}
                        <div style="font-weight: normal; font-size: small">{manifest.author || 'unknown'}</div>
                        <div style="font-weight: normal; font-size: normal; margin: 10px 0 0;">{manifest.desc || 'unknown'}</div>
                    </div>
                </div>

                <div class="btn light radius px16 {status > 0 ? '' : 'disabled'}"
                    style="align-self: flex-end;"
                    on:click={ev => installHandler(ev, name, status)}>{
                    s(textMapping[status])
                }</div>
            </div>
            {/await}
            {/await}
            {/each}
        </ScrollView2>
    {/await}
</div>
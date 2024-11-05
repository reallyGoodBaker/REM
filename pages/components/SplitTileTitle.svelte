<script>
    import { onMount } from "svelte";
    import { neteaseImgSizeParam } from "../../utils/stores/img"
    import Image from './Image3.svelte'

    let image, canUpdate = false
    export let data = {}

    function renderImage(data) {
        if (canUpdate) {
            image.render(data.picUrl + neteaseImgSizeParam(32, 32), true)
        }
    }

    onMount(() => canUpdate = true)

    $: renderImage(data)
</script>

<style>
    .title {
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
    }

    .Row {
        user-select: none;
    }
</style>

<div class="Row" style="flex-wrap: nowrap; width: 100%;">
    <Image bind:this={image} radius="8px" width={32} height={32} src={data.picUrl + neteaseImgSizeParam(32, 32)}/>
    <div class="title" style="margin-left: 8px;">{data.title}</div>
</div>
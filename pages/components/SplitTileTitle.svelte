<script>
    import { neteaseImgSizeParam, getImgSrc } from "../../utils/stores/img"

    export let data = {}
</script>

<style>
    .title {
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
    }

    .img {
        border-radius: 8px;
    }

    .placeholder {
        width: 32px;
        height: 32px;
        background-color: var(--controlGray);
    }
</style>

<div class="Row" style="flex-wrap: nowrap; width: 100%;">
    {#await getImgSrc(data.picUrl + neteaseImgSizeParam(32, 32))}
    <div class="img placeholder"></div>
    {:then src} 
    <img draggable="false" alt="img" class="img" width={32} height={32} {src}/>
    {/await}
    <div class="txt title" style="margin-left: 8px;">{data.title}</div>
</div>
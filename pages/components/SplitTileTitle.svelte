<script>
    import { neteaseImgSizeParam } from "../../utils/stores/img"
    import Image from "./Image.svelte"

    export let data = {}
</script>

<style>
    .title {
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
    }
</style>

<div class="Row" style="flex-wrap: nowrap; width: 100%;">
    <Image width={32} height={32} borderWidth='0px' src={data.picUrl + neteaseImgSizeParam(32, 32)}/>
    <div class="txt title" style="margin-left: 8px;">{data.title}</div>
</div>
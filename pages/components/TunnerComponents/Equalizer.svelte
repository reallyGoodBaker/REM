<script>
    import BqFilter from "./BqFilter.svelte";

    export let enable = true
</script>

<BqFilter f={31} bind:enable/>
<BqFilter f={62} bind:enable/>
<BqFilter f={125} bind:enable/>
<BqFilter f={250} bind:enable/>
<BqFilter f={500} bind:enable/>
<BqFilter f={1000} label={'1k'} bind:enable/>
<BqFilter f={2000} label={'2k'} bind:enable/>
<BqFilter f={4000} label={'4k'} bind:enable/>
<BqFilter f={8000} label={'8k'} bind:enable/>
<BqFilter f={16000} label={'16k'} bind:enable/>
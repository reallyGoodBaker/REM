<script>
    import Progress from "../../../../pages/components/Progress.svelte"

    export let label = ''
</script>

<style>
    .container {
        height: 32px;
        justify-content: space-between;
        width: 100%;
    }
</style>

<div class="Row container">
    <div>{label}</div>
    <Progress/>
</div>
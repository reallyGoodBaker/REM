<script>
    import Avatar from "./components/Avatar.svelte";
    import Input from "./components/Input.svelte";

    let profile = store.get('profile');

    function uploadAvatar() {

    }
</script>


<style>
    .input {
        position: relative;
        align-items: flex-start;
        box-sizing: border-box;
        margin-bottom: 12px;
    }

    .input > span {
        margin: 8px;

    }
</style>


<Avatar
    avatar={profile.avatarUrl}
    width={120}
    height={120}
    on:click={uploadAvatar}
/>

<div class="row input">
    <span>昵称</span>
    <Input id={'profileName'} value={profile.nickname}/>
</div>

<div class="row input">
    <span>介绍</span>
    <Input id="profileDesc" maxlength={300} value={profile.description} singleLine={false} cssText={'height: 120px'}/>
</div>
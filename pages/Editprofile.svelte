<script>
    import Avatar from "./components/Avatar.svelte";
    import Input from "./components/Input.svelte";
    import {store} from '../utils/stores/base.js'

    let profile = store.getSync('profile')

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

    .profile-card {
        width: 600px;
        height: 400px;
        background-color: var(--controlBrighter);
        border-radius: 16px;
        justify-content: flex-start;
        overflow: hidden;
    }

    .avatar {
        width: 200px;
        height: 100%;
        background-color: var(--controlBright);
    }

    .nickname {
        color: var(--controlDarker);
        font-size: x-large;
        font-weight: bold;
        margin: 20px 0 0;
    }
</style>

<div class="profile-card column">

<div class="avatar row">
    <Avatar
        avatar={profile.avatarUrl}
        width={120}
        height={120}
        on:click={uploadAvatar}
    />

    <div class="nickname">{profile.nickname}</div>
</div>

<div class="row" style="width: calc(100% - 200px)">
    <div class="row" style="width: max-content;">
        <div class="row input">
            <span>昵称</span>
            <Input id={'profileName'} value={profile.nickname}/>
        </div>
        
        <div class="row input">
            <span>介绍</span>
            <Input id="profileDesc"
                maxlength={300}
                value={profile.description}
                singleLine={false}
                cssText={'height: 60px'}/>
        </div>
    
        <div class="column" style="justify-content: flex-end; width: 100%; margin-top: 12px;">
            <div class="btn big accent">保存修改</div>
        </div>
    </div>
</div>

</div>
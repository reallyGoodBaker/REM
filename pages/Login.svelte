<script>
    import {getContext} from 'svelte';
    import RippleLayer from './components/RippleLayer.svelte';

    const performClick = getContext('close') || (() => {
        __emitter.emit('__openMinePage');
        __emitter.emit('__updateLoginAvatar');
    });

    let phone, passwd, error = false;

    async function doLogin() {
        const res = await NeteaseApi.login(phone, passwd);
        if(res.body.code !== 200) {
            passwd = '';
            error = true;
            return ;
        }
        localStorage.setItem('profile', JSON.stringify(res.body.profile));
        localStorage.setItem('token', JSON.stringify(res.body.token));
        store.set('cookie', res.cookie.join(''));
        performClick();
    }

    let loginTypeEnum = ['手机', '二维码'];
    let loginType = 0;
    let img;


    let qrimg = '', message = '等待扫描';
    async function getQRLoginInfo() {
        const qrData = await NeteaseApi.loginViaQRCode();
        const key = qrData[0];
        qrimg = qrData[1].body.data.qrimg;

        let doValide = async () => {
            const res = await NeteaseApi.validQRLogin(key);

            if (loginType !== 1) return;

            let loop = () => setTimeout(async () => {
                await doValide();
            }, 500);

            message = res.body.message;

            switch(res.body.code) {
                case 801: loop(); break;

                case 800: getQRLoginInfo(); break;

                case 802: img.style.opacity = 0.32; loop(); break;

                case 803: {
                    store.set('cookie', res.body.cookie);
                    getAccount(); 
                    break;
                }
            }

        }

        doValide();

    }

    async function getAccount() {
        const res = await NeteaseApi.getUserAccount(store.get('cookie'));
        store.set('profile', res.body.data.profile);
        performClick();
    }

</script>

<style>
    .c {
        width: fit-content;
        height: fit-content;
        padding: 12px 8px;
    }

    input {
        width: 200px;
        height: 36px;
        outline: none;
        border: solid 2px transparent;
        border-radius: 8px;
        margin: 0px 4px;
        background-color: #eee;
        margin-bottom: 8px;
        padding: 0px 12px;
    }

    input.error {
        border: solid 2px red;
    }

    .submit {
        width: 200px;
        height: 32px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.12s;
    }

    .submit:hover {
        background-color: darkred;
        color: #fff;
    }

    .span {
        font-size: x-small;
        cursor: pointer;
    }

    .span:hover {
        color: red;
    }

    .img {
        border: none;
        outline: none;
    }
</style>

<div class="row c">
    <h3>{loginTypeEnum[loginType]}登录 <span class="span" on:click={() => {
        loginType = loginType? 0: 1;
        loginType && getQRLoginInfo();
    }}>使用{loginTypeEnum[loginType? 0: 1]}</span></h3>
    {#if !loginType}
        <input type="text" class="{error&&'error'}" bind:value={phone} placeholder="电话">
        <input type="password" class="{error&&'error'}" bind:value={passwd} placeholder="密码">
        <div style="padding: 24px 0px 12px 0px;">
            <RippleLayer
                rippleColor={'#000'}
                cssStyle={'border-radius: 8px;'}
            >
                <div on:click={doLogin} class="column submit">登陆</div>
            </RippleLayer>
        </div>
    {:else if qrimg}
        <img bind:this={img} src={qrimg} width={228} height={228} draggable="false" alt=" " style="border-radius: 24px;">
        <h5>{message}</h5>
    {/if}
</div>
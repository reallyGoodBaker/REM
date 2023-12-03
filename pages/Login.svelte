<script>
    import { getContext, onMount } from 'svelte'
    import RippleLayer from './components/RippleLayer.svelte'
    import {store} from '../utils/stores/base.js'
    import { rem } from '../utils/rem.js'

    const s = (f, ...args) => langMapping.s(f, ...args) || f

    const performClick = getContext('close') || (() => {
        rem.emit('__openMinePage')
        rem.emit('__updateLoginAvatar')
        Pager.removeCurrent()
    })

    let phone, passwd, error = false;

    async function doLogin() {
        const res = await NeteaseApi.login(phone, passwd);
        if(res.body.code !== 200) {
            passwd = '';
            error = true;
            return ;
        }
        await Promise.all([
            store.set('profile', JSON.stringify(res.body.profile)),
            store.set('token', JSON.stringify(res.body.token)),
            store.set('cookie', res.cookie.join('')),
        ])
        saveAccount()
    }

    let loginTypeEnum = ['phone_number', 'qr_code'];
    let loginType = 1;
    let img;


    let qrimg = '', message = 'wait_scanning';
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
                    saveAccount(); 
                    break;
                }
            }

        }

        doValide();

    }

    async function saveAccount() {
        const res = await NeteaseApi.getUserAccount(await store.get('cookie'));
        const p = res.body.data.profile
        store.set('profile', p)
        rem.emit('logined', p)
        performClick();
    }

    getQRLoginInfo()

    onMount(() => {
        Pager.setSearchPlaceholder('')
    })

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
    <h3>{s('login_type', s(loginTypeEnum[loginType]))}
        <!-- <span class="span" on:click={() => {
            loginType = loginType? 0: 1
            loginType && getQRLoginInfo()
        }}>{s('switch_to')}{s(loginTypeEnum[loginType? 0: 1])}</span> -->
    </h3>
    {#if !loginType}
        <input type="text" class="{error ? 'error' : ''}" bind:value={phone} placeholder={s('phone_number')}>
        <input type="password" class="{error ? 'error' : ''}" bind:value={passwd} placeholder={s('password')}>
        <div style="padding: 24px 0px 12px 0px;">
            <RippleLayer
                rippleColor={'#000'}
                cssStyle={'border-radius: 8px;'}
            >
                <div on:click={doLogin} class="column submit">{s('login')}</div>
            </RippleLayer>
        </div>
    {:else if qrimg}
        <img bind:this={img} src={qrimg} width={228} height={228} draggable="false" alt=" " style="border-radius: 24px;">
        <h5>{s(message)}</h5>
    {/if}
</div>
<script>
    import { createEventDispatcher } from "svelte";


    export let type = 'text';
    export let id = 'default-id';
    export let value = '';
    export let singleLine = true;
    export let maxLength = 999999;
    export let cssText = '';
    export let fullBorder = false;
    export let placeholder = '';
    
    let emit = createEventDispatcher();
    let focused = false;

    function onFocus() {
        focused = true;
        emit('focus');
    }

    function onBlur() {
        focused = false;
        emit('blur');
    }

    function onChange() {
        emit('change');
    }

    function onInput() {
        emit('input');
    }
</script>


<style>
    .input {
        position: relative;
        overflow: hidden;
        border-radius: 8px 8px 0px 0px;
        background-color: rgba(255,255,255,0.6);
    }

    .input::after {
        content: '';
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%);
        width: 0%;
        height: 2px;
        background-color: var(--controlColor);
        transition: all 0.16s;
    }

    .input.focus::after {
        width: 100%;
    }

    input, textarea {
        display: block;
        font-family: Roboto, sans-serif;
        outline: none;
        border: none;
        border-bottom: solid 2px #aaa;
        width: 200px;
        background-color: transparent;
        padding: 8px;
        resize: none;
        height: 16px;
    }

    .full-border {
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        background-color: rgba(255,255,255,0.4);
        border: solid 2px rgba(0,0,0,0.1);
        border-color: transparent;
        border-radius: 8px;
        transition: all 0.16s;
    }

    .full-border.focus {
        /* border-color: var(--controlColor); */
        background-color: rgba(255,255,255,0.8);
    }

    .full-border > input, .full-border > textarea {
        border: none;
    }

    input, textarea {
        font-family: "iconfont", Roboto, sans-serif;
    }
</style>


<div class="{fullBorder?'full-border':'input'}{focused?' focus':''}">
    {#if singleLine}

    <input {type} {id}
        on:focus={onFocus}
        on:change={onChange}
        on:input={onInput}
        on:blur={onBlur}
        {value}
        style={cssText}
        {placeholder}>

    {:else}

    <textarea {type} {id}
        on:focus={onFocus}
        on:change={onChange}
        on:input={onInput}
        on:blur={onBlur}
        {value} {maxLength}
        style={cssText}
        {placeholder}
    ></textarea>
        
    {/if}
</div>
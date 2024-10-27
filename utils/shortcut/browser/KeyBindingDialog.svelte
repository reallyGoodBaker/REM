<script>
import RippleLayer from "../../../pages/components/RippleLayer.svelte"
import { vsync } from "../../core/vsync"
import { promiseResolvers } from "../../high-level/browser/promise"
import { saveKeybinding } from "./app";
import { useRecordMode } from "./core"
import KeyBinding from "./KeyBinding.svelte"

$: L = langMapping.s
let flag = 0
let key = ''
let dialog
let bindingElement
let editHandler = Function.prototype

export async function openDialog(binding) {
    const { promise, resolve } = promiseResolvers()
    const { getKeyset, depose } = useRecordMode()
    const { cancel } = vsync(() => {
        const keyset = getKeyset() || binding
        flag = keyset.flag
        key = keyset.key
        bindingElement.render()
    })

    editHandler = () => {
        binding.flag = flag
        binding.key = key
        dialog.close()
        saveKeybinding(binding)
    }

    dialog.onclose = () => {
        cancel()
        depose()
        editHandler = Function.prototype
        resolve()
    }

    dialog.showModal()

    return promise
}
</script>

<style>
    .dialog {
        color: var(--controlBlack);
        pointer-events: all;
        box-sizing: border-box;
        border-radius: 24px;
        padding: 20px;
        background-color: var(--controlBright88);
        user-select: none;
    }

    .button {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        width: 100%;
        padding: 12px;
    }
</style>

<dialog bind:this={dialog}>
    <div class="dialog">
        <h2>{window.langMapping.s('change_keybind')}</h2>
        <KeyBinding bind:this={bindingElement} {flag} {key}/>
        <div class="alertButtonGroup" style="margin-top: 20px;">
            <RippleLayer useHoverLayer={true} rippleColor='var(--fadeDark)'>
                <div class="button" on:click={() => editHandler()}>{L('done')}</div>
            </RippleLayer>
            <RippleLayer useHoverLayer={true} rippleColor='var(--fadeDark)'>
                <div class="button" on:click={() => dialog.close()}>{L('cancel')}</div>
            </RippleLayer>
        </div>
    </div>
</dialog>
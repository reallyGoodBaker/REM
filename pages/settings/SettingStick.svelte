<script>
    import RowList from "../components/RowList.svelte"
    import SelectListTile from "../components/SelectListTile.svelte"
    import {store} from '../../utils/stores/base.js'

    function lang(key) {
        return langMapping.s(key)
    }

    let leftStick = store.getSync('AppSettings/left_stick') || {
        levels: [
            {label: lang('slow'), value: 0.3},
            {label: lang('medium'), value: 0.65},
            {label: lang('fast'), value: 1}
        ],
        selected: 1
    }

    let rightStick = store.getSync('AppSettings/right_stick') || {
        levels: [
            {label: lang('slow'), value: 0.3},
            {label: lang('medium'), value: 0.65},
            {label: lang('fast'), value: 1}
        ],
        selected: 1
    }

    let left = leftStick.selected, right = rightStick.selected

    function onSelectStickSpeedRatio({detail}) {
        rightStick.selected = right = detail
        store.set('AppSettings/right_stick', rightStick)
    }

    function onSelectCursorMoveSpeedRatio({detail}) {
        leftStick.selected = left = detail
        store.set('AppSettings/left_stick', leftStick)
    }
</script>

<RowList title={lang('controller')}>
    <SelectListTile
        data={lang('page_scroll_speed')}
        bind:dataList={rightStick.levels}
        bind:selected={right}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectStickSpeedRatio}
    />

    <SelectListTile
        data={lang('cursor_move_speed')}
        bind:dataList={leftStick.levels}
        bind:selected={left}
        useAvatar={false}
        isUrl={false}
        on:selected={onSelectCursorMoveSpeedRatio}
    />
</RowList>
export interface ViewRect {
    y: number
    x: number
    width: number
    height: number
}

const zeroRect = { y: 0, x: 0, width: 0, height: 0 }

export const ViewRect = {
    zero: () => zeroRect,
    from: (x = 0, y = 0, width = 0, height = 0) => ({ x, y, width, height }),
}

export interface RecyclerViewAdapter {
    /**
     * 只会调用一次
     */
    count(): number

    /**
     * 在view加入之前被调用,用于计算与窗口的交叉区域
     * 
     * 请不要在这里使用 `getBoundingClientRect` 获得 `DOMRect`, 因为它会导致 `TypeError`
     * 
     * 当你指定了 `RecyclerView` 的 `orientation` 不为 `grid` 时, RecyclerView
     * 会根据方向自动处理view的宽高, 比如当 `orientation` 为 `vertical` 时, RecyclerView
     * 会忽略 `ViewRect` 的 `width` 值
     */
    rect(position: number): ViewRect

    /**
     * 从这里取出的 view 将会被渲染到 RecyclerView 中
     */
    view(position: number): HTMLElement

    /**
     * 当一个 view 被认为不再需要在屏幕上显示时, 该函数会被调用, 用于回收该view
     * 
     * 你可以使用一个简单的对象池来回收这些节点
     */
    recycle(position: number, view: HTMLElement): void
}

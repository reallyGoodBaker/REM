# IPC

调用为从左到右调用并返回结果

| 主进程              | 渲染进程             |
| ---------------- | ---------------- |
| Invoker.invoke() | Invoker.handle() |

| 渲染进程         | 主进程              |
| ------------ | ---------------- |
| hooks.send() | ipcMain.handle() |

| 主进程                     | 插件线程      |
| ----------------------- | --------- |
| ExtensionHost.request() | provide() |

| 插件线程     | 主进程                       |
| -------- | ------------------------- |
| invoke() | ExtensionHost.events.on() |





### 渲染进程事件总线

```ts
export const rem: EventEmitter
```



# EventEmitter
## 自定义事件监听器

类似于`JQuery`的`on`的绑定方式，实现对自定义事件的监听与回调函数。

**下面是一个简单的例子：**

```js
const EventEmitter()=require('path/to/EventEmitter.js')

let myEvt = new EventEmitter()

myEvt.on('testEvent',(data)=>{
    console.log("hello world ",data)
})


setTimeout(()=>{
	myEvt.emit('testEvent','JavaScript!')
},3000)

```

**结果**

3000ms之后：

```
hello world JavaScript!
```

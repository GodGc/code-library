# Interview

> [面试注意事项](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651235882&idx=2&sn=346a3e9d351b8815d310e5f118719cca&chksm=bd497fae8a3ef6b87920385507804d5c20246051bacf8d9a149e600d8bf5e5c0987ce37e66cd&mpshare=1&scene=1&srcid=&sharer_sharetime=1583535813224&sharer_shareid=0b94c73df48513ed6d090a244e519f53&key=324e443932aeb1ae9c4deb728d1653d6c9e9eb5f60b8cffa095e4548873b0bbe1b6d58184298b76f27714cd1133ff9a205fec0ccf35ed2b8017d070e2089cfbe74667a750d4cd2ac1f30e5253df4168c&ascene=1&uin=NjM4OTgxNjAx&devicetype=Windows+10&version=62080079&lang=zh_CN&exportkey=Ay4Rs8U%2FepT5WxS5SnmPhy4%3D&pass_ticket=D60bwsqfiqlKytevV5nIaAKOFSNlAfUUt42rTxJt2%2B9Wdlua8KxPFpBdC29Jjlgs)

## 充电整理

### 常识

#### HTTP缓存

- 强缓存

  在强制缓存时间内，请求同意资源将使用缓存

  对应相应头：

  【低优先级】`Expires` 过期时间，可以等于0

  【高优先级】`Cache-Control: max-age=60` 指令说明 缓存机制

  可以做兼容处理，先【高】后【低】

- 协商缓存

  对应相应头：

  【高】`Pragma: no-cache`

  【低】`Cache-Control: no-cache/max-age=0`

- 如都未设定，则进入浏览器-服务器协商策略流程

  `Etag: xxxxxx`进行hash对比

  `Last-modified`进行最后更改时间对比

#### Event-Loop

- 同步任务进入执行栈
  - 同步任务空时，查看异步任务队列是否有完成的
- 异步任务进入任务队列（堆）
  - 异步任务进入任务队列后，保持挂起，等待执行栈为空
  - 异步任务先执行**微任务**、后执行**宏任务**

#### compose实现

```javascript
function compose(...fns){
  if(fns.length == 0) arg=>arg;
  
  if(fns.length == 1) fns[0];
  
  fns.reduce((pre, cur)=>{
    return (...arg)=> pre(cur(...arg))
  })
}
```

#### flat 拍平数组

```javascript
function flat(arr){
  // 边界容错
  /// ...
  
  return arr.reduce((pre, cur) =>{
    return pre.concat(Array.isArray(cur)? flat(cur): cur)
  }))
}
```

#### 实现一个call

```javascript
Function.prototype.myCall = function(ctx = window){
  ctx.fn = this;
  let restArgs = [...arguments].slice(1);
  let result = ctx.fn(...restArgs);
  delete ctx.fn;
  return result;
}
```

### React

> JSX == (Babel) ==> React.createElement => vDom+Fiber => ReactDOM.render => DOM

#### vDOM

- 数据驱动视图
- vDOM不依附于特定框架
- 提升研发体验+效率
- 不一定能够提高性能，需要根据具体的项目体量具体分析

#### Reconcile 调和

> Diff 只是调和过程中的一环

- React 15 是栈调和 **stack reconcile** => 同步的递归过程，所以可能会阻塞用户交互
- React 16 是fiber调和 **fiber reconcile** => 异步的递归过程，具有 **时间切片、优先级** 的特点 => 提高用户体验度
  - 时间切片中优先级是由每个 fiber 的 `expirationTime`决定的，`expirationTime`来自`priorityLevel` => 包含用户的UI操作、不同时间等，在React源码中对所有常用时间进行了归类
  - 如果当前进行一个低优先级任务时，插入一个高优先级任务，则会放弃当前组件所有干到一半的事情，去做更高优先级的任务（用户交互事件等），当所有高优先级任务执行完毕后，react通过callback回到之前渲染到一半的组件，从头开始渲染（所以低优先级任务可能要被执行多次，且其中的生命周期也会多次触发，这也是react去更改生命周期hook的一个原因⬇️）
    - 移除ComponentWillMount、ComponentWillUpdate、componentWillReceiveProps，增加了一个挂载、更新都会执行的生命周期： `getDerivedStateFromProps(props, state)` 使用props来派生、更新state，是一个静态方法，没有this，所以不能访问到当前组件的this，返回一个对象格式的返回值会被合并到当前组件的state中

#### 生命周期

![image-20210418214339372](/Users/cegao/Library/Application Support/typora-user-images/image-20210418214339372.png)

0. 初始化阶段

1. render阶段

   是一个递归的过程，找出每个组件Effict List并且储存在上一级父组件Fibber节点EffectList中 => firstEffect\lastEffect

   - legacy模式 - 同步 - 目前正在使用的

   - blooking模式 - 过渡模式

   - concurrent模式 => `ReactDom.createRoot(rootNode).render(<App />)` 异步渲染

2. pre-commit阶段

3. commit阶段

   处理Effect List

   - before mutation 阶段 - 尚未渲染DOM至界面
   - mutation 阶段 - 负责DOM渲染
   - Layout 阶段： DOM渲染完毕收尾

#### setState

会有同步、异步更新的情况

- 异步时是为了合并多个setState，进行批量更新，避免多次re-render
- 同步场景：`setTimeout、setInterval、Promise`等，这种场景下因为时执行异步任务，所以会脱离react异步处理中事务调度系统中的 **锁**，`isBatchingUpdate`锁就是个boolean值，当执行时锁住，执行完false，异步执行时锁就已经变成了false，所以会脱离

#### 事件系统

合成事件会在Document上注册一个事件分发函数`dispatchEvent`，负责触发对应的事件，通过正序/倒叙来模拟正常事件触发过程中的捕获/冒泡过程。

优点：

- 在底层上磨平了浏览器之间兼容性的不同差异
- 在上层向开发者暴露了一个统一、稳定、与DOM原生事件相同的事件接口（e.nativeEvent）
- 对事件拥有了主动权

总结：事件委托帮助React实现了对所有事件的 **中心化管理**

#### HOOK组件

> 原则：不要在循环、条件或嵌套函数中调用HOOK，因为这样可能会导致每次执行的hooks不一致，要确保HOOKS在每次渲染时都保持相同的执行顺序

**因为HOOKS的正常运行，在底层依赖于一个顺序链表，如果在后续执行HOOKS少了或者多了，则会导致这个顺序链表识别不正常，导致出现bugs**

#### 组件间的通信

- props

- 发布-订阅模式，建立一个事件处理中心 `EventEmitter` ，用来注册、读取调用等

- `Context` api

  - [Provier\Consumer]进行传播和消费store
  - `const Manager = React.createContext({})`

- `Redux`等第三方状态管理

  工作流程：某个组件的view派发action，reduce处理dispatch过来的action，由actions的不同修改数据，生成新的Store，

  - Store会通过入口组件的provede组件进行注入，子组件会通过connect组件（高阶组件将Store中的数据注入到当前组件的props中，dispatch也会注入进来）
  - 通过props.store获取祖先Component的store
  - props包括stateProps、dispatchProps、parentProps,合并在一起得到nextState，作为props传给真正的Component
  - **componentDidMount时，添加事件this.store.subscribe(this.handleChange)，实现页面交互** - 关键
  - shouldComponentUpdate时判断是否有避免进行渲染，提升页面性能，并得到nextState
  - componentWillUnmount时移除注册的事件this.handleChange

#### Redux中使用thunk进行网络请求

使用Redux的中间件：`redux-thunk`进行网络请求，编写对应的actions

```javascript
export const FETCH_PRODUCTS_BEGIN   = 'FETCH_PRODUCTS_BEGIN';
export const FETCH_PRODUCTS_SUCCESS = 'FETCH_PRODUCTS_SUCCESS';
export const FETCH_PRODUCTS_FAILURE = 'FETCH_PRODUCTS_FAILURE';

export const fetchProductsBegin = () => ({
  type: FETCH_PRODUCTS_BEGIN
});

export const fetchProductsSuccess = data => ({
  type: FETCH_PRODUCTS_SUCCESS,
  payload: { data }
});

export const fetchProductsFailure = error => ({
  type: FETCH_PRODUCTS_FAILURE,
  payload: { error }
});

export function fetchData () {
    return dispatch => {
        dispatch(fetchProductsBegin());
        return fetch("/data-api")
            .then(res=>res.json())
            .then(json=>{
                dispatch(fetchProductsSuccess(json.data));
                return json.data
            })
            .catch(error=> dispatch(fetchProductsFailure(error)))
    }
}

```

对应的reduce

```javascript
import {
    FETCH_PRODUCTS_BEGIN,
    FETCH_PRODUCTS_SUCCESS,
    FETCH_PRODUCTS_FAILURE
  } from "./dataActions";
  
  export default function dataReducer(state=null, action) {
    switch(action.type) {
      case FETCH_PRODUCTS_BEGIN:
        // 把 state 标记为 "loading" 这样我们就可以显示 spinner 或者其他内容
        // 同样，重置所有错误信息。我们从新开始。
        return {
          ...state,
          loading: true,
          error: null
        };
  
      case FETCH_PRODUCTS_SUCCESS:
        // 全部完成：设置 loading 为 "false"。
        // 同样，把从服务端获取的数据赋给 data。
        return {
          ...state,
          loading: false,
          data: action.payload.data
        };
  
      case FETCH_PRODUCTS_FAILURE:
        // 请求失败，设置 loading 为 "false".
        // 保存错误信息，这样我们就可以在其他地方展示。
        // 既然失败了，我们没有产品可以展示，因此要把 `items` 清空。
        //
        // 当然这取决于你和应用情况：
        // 或许你想保留 items 数据！
        // 无论如何适合你的场景就好。
        return {
          ...state,
          loading: false,
          error: action.payload.error,
          items: []
        };
  
      default:
        // reducer 需要有 default case。
        return state;
    }
  }
  
```

然后在对应的组件执行：

`Store.dispatch(fetchData())`

#### 自定义hooks实现一个debounce

```react
function useDebounce(fn, wait = 50, dep = []){
  const {current} = useRef({fn, timer=null}); // 创建ref容器存储需要的数据
  
  useEffect(function(){ // 挂载fn至ref容器
    current.fn = fn;
  }, [fn]);
  
  return useCallback(function(...arg){ // 返回函数
    if(current,timer) clearTimeout(current.timer);
    
    current.timer = setTimeout(()=>{
      current.fn.call(this, ...arg)
    }, wait)
  }, dep)
}
```

#### React的性能优化

普世类优化：

- 减少不必要的网络请求
- CDN缓存
- 代码压缩减少请求文件体积
- 减少重绘、回流
- 懒加载、预加载

React侧：

1. `shouldComponentUpdate(nextProps, nextState)`

   增加有条件的判断，手动干预 re-reder，避免父组件内部的值变更导致子组件进行的 re-render

2. `PureComponent + Immutable.js`

   PureComponent内置了props的浅比较 => shollowEqual => 会比较前后的props的Obejct.keys的长度、内容等

   Immutabel.js是避免使用PureComponent导致意外的不更新现象，因为复杂数据是使用的引用地址比较，使用Immutable可以创建“持久性数据”，任何修改动作都会返回一个新值 => 使用map创建，map.set修改

3. React.memo 和 useMemo

   都是给函数组件使用的

   - React.memo是一个高阶组件 => 在相同props下复用最近的一次渲染结果，也可以传入第二个参数：一个自定义对比前后props的函数

     ```react
     function MyComponent(props) {
       /* 使用 props 渲染 */
     }
     function areEqual(prevProps, nextProps) {
       /*
       如果把 nextProps 传入 render 方法的返回结果与
       将 prevProps 传入 render 方法的返回结果一致则返回 true，
       否则返回 false
       */
     }
     ```

   - useMemo

     记忆某个值

     `const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`

     记忆某个组件

     ```react
     // 子组件
     function Child(props){};
     
     // 使用useMemo包裹
     return(
      <div>
        useMemo(()=>{
           return Child(data)
         }, [data])
       </div>
     )
     ```

     是一个更加精细的优化手段，是否需要重复执行某一段逻辑，其返回一个memorized值

   - useCallback也可以使用一下，只有依赖项改变时才会执行回调函数

## 上海头条广告

1、mock api
为什么去做？

- 代替口头约定接口方案
- 提升效率工作效率
- 技术保障
    对接 yapi，实现部署
- 完成项目部署全流程
- 修复测试接口导出报告 bug
- 登录 LDAP  plugin  开发

2、Hybird  VS H5

- 宿主环境区别
- 唤起原生 APP 能力、
- 如何唤起分享？

3、sdk.js   - JSBridge

- JSBridge
      - 通信是双向的。
      - webview 提供 API
- 如何使用

4、前端团队
 - 四套脚手架
    - M  站   JS TS
    - PC JS TS

- 业务代码组件库

- 脚手架价值
  - 帮助经验不足的同学快速启动项目
  - 技术沉淀
  - TS 规范代码
  - ESlint  约束代码
  - 项目解构
- 不太好的点：
  - 不利于非开发脚手架同学的技术沉淀
- 解决方案
  - 周三团队技术分享。
- 脚手架升级
  - 自定义文件名

5、webpack

- plugins
- happy webpack
- less  loader 有几个？

6、Fetch  和  Ajax(xhr)  的区别是什么？
baidu.com get json
实现一个 Ajax

7、JS  函数节流和防抖

## binance

### 一面

- 如果不用 includes，那么如何查找字符串中的某个字符？
  - indexOf
  - 正则匹配，（如何编写一个匹配手机号的正则）
- forEach 和 map 的区别
- every 和 any 的区别、它们可以手动打断吗？
- 如何合并 2 个数组
  - concat
  - 其他呢？ES6 结构赋值
- 如何查找数组中某个元素出现了多少次
- webpack 分模块打包、多入口打包/多页面打包？
- webpack 提取多页面（项目）都引用的库 vendor，
  - optimization-代码分割

```javascript
        optimization: {
            splitChunks: {
              cacheGroups: {
                // 打包业务中公共代码  priority低，后提取
                // 只提取common和styles目录下的文件，打包成common.js和common.css
                // 否则会把任意目录下的文件也打包进common里，造成污染
                common: {
                      name: "common",
                      chunks: "initial",
                      test: /[\\/]src[\\/](common|styles)/,
                      minSize: 1,
                      priority: 0,
                      minChunks: 3,
                },
                // 打包node_modules中的文件 priority更高，先提取
                vendor: {
                      name: "vendor",
                      test: /[\\/]node_modules[\\/]/,
                      chunks: "initial",
                      priority: 10,
                      minChunks: 2,
                }
              }
            },
            runtimeChunk: { name: 'manifest' } // 运行时代码
          },
```

- react 15 的 diff 算法，key 是干什么的
- react 16
  - 常用 hook：useCallback、useEffect、useMemo...
  - 如何在函数组件中发起网络请求，在哪个生命周期？
  - SSR 渲染，react 的自带 api、renderToString？
  - setState 的时候发生了什么？
- redux 是什么，怎么用，常用 api ,reduce?
- react pureComponent 和 class component 的区别
- 输入 url 到页面出现都发生了什么
- 如果没有联网，那么还会发起请求吗？
  - 不会，浏览器的 network 线程会判断是否联网
- CSRF 攻击是什么？
  - 如何防御？
  - 如何设置 cookie 只能在线读取？http only
- git 的常见命令
  - 如果在从 a 分支创建的 b 分支有 1、2、3 功能 commit，如何让 a 只有 2 功能？精准移动 commit
  - git reset hard 和 soft 的区别
    - hard 物理删除
    - 会保存工作区和暂存区

> Hooks 官方文档：
> [https://zh-hans.reactjs.org/docs/hooks-intro.html](https://zh-hans.reactjs.org/docs/hooks-intro.html)
> 10 分钟教你手写 8 个常用的自定义 hooks
> [https://juejin.im/post/5e57d0dfe51d4526ce6147f2?utm_source=gold_browser_extension#heading-5](https://juejin.im/post/5e57d0dfe51d4526ce6147f2?utm_source=gold_browser_extension#heading-5)

### 二面

- 写一个 modal box 组件
  - 参考：[https://www.jianshu.com/p/810e8104f72f](https://www.jianshu.com/p/810e8104f72f)
  - 如果调用者有 overflow：hidden，如何确保 modal 可以正常出现？
    - 插入到 body 下面，如何操作? appendChild 和 react createPortal

```javascript
import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./Portal.css";

export default function Portal(WrappedComponent) {
    return class extends Component {
        constructor(props) {
            super(props);
            //直接插入dom节点到body下
            if (!this.node) {
                this.node = document.createElement("div");

                document.body.appendChild(this.node);
            }
        }
        //组件即将卸载时候删除dom节点
        componentWillUnmount() {
            this.node && this.node.remove();
        }
        //渲染内容
        renderContent() {
            return (
                <div>
                    <div className="portal-bgc" onClick={this.props.hide} />
                    {/*给WrappedComponent传递props*/}
                    <WrappedComponent {...this.props} />
                </div>
            );
        }

        render() {
            const { visible } = this.props;
            //visible控制显示/隐藏
            if (visible) return this.node && ReactDOM.createPortal(this.renderContent(), this.node);
            else return null;
        }
    };
}
```

- 如何全屏居中
- 相对比其他面试者，自身有什么优势？
  - 兴趣驱动
  - 英语
  - 思维
  - 沟通

### 三面

1. 讲一下技术背景，不包含业务（主要讲一下技术栈）
2. react+redux
    - 点击页面一个按钮改变一个 redux 中的值，页面中 3 个组件进行了改变，请问这个数据是如何流动并且触发到这 3 个组件上的，对应的 api 需要讲出 以及 数据流
3. react 中长列表定时推送一条新数据插入到最顶上，如果做到性能优化，保证浏览器不卡死
    - 这个点参照长列表渲染（[长列表优化](//www.godrry.com/code-library/#/main/JavaScript/ES5?id=react%e9%95%bf%e5%88%97%e8%a1%a8%e4%bc%98%e5%8c%96)）
4. webpack 中 有 ABCD 四个依赖（js），如何在打包的时候把 ABC 打包到一个文件里，D 打包在另外一个文件里
5. webpack 如果缓存某个库，以达到下次打包时加快打包速度

## ZOOM

3月25日下午2:00面试

**ZOOM的面试经过了2轮技术面+1轮HR面，过程都很顺利，但是没有发offer，个人感觉可能是offer的价格没谈拢吧，还是比较遗憾的，因为当时对ZOOM的感觉还是不错的，很想进，可惜缘分未到**

### 一面：前端面

> 一面时长1小时，实际要多一点，因为自己提前10分钟进入zoom会议室就直接开始问答了，当然第一个就是进行自我介绍。
> 接下来是：

- es5到es6，有什么变化？
- 原型链，怎么不用instance of知道一个对象的类型。
- 正则表达式中的exce方法，
  该函数返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null
  `/e/.exec("The best things in life are free!");`
- apply和call的区别。怎么用apply计算一个数组的最大值。
- bind是做什么用的，如何实现？
- typeof和instanceof的区别。
- 怎么设置一个变量的默认值。
- 继承有哪些种？答了ES5的组合继承和ES6的class继承，class继承可以继承static静态变量
- 为什么js有变量提升？逐行编译、加快编译速度、减少错误程度
- 问了parseInt()方法，答：不清楚
- arguments是什么？
- 如何给数组对象添加一个自定义方法：挂载到Array.prototype上
- `use strict`是什么：答严格模式，不会有变量提升等操作
- 自执行函数是什么？具体怎么写？
- 如何监听页面变化：答：自己暂时还未遇到要监听页面变化的场景，一般都是通过事件来监听某些变化的，比如`onClick`事件等。
   正确：`MutationObserver`
   >MutationObserver给开发者们提供了一种能在某个范围内的DOM树发生变化时作出适当反应的能力.该API设计用来替换掉在DOM3事件规范中引入的Mutation事件.

   ```javascript
   var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
   
  // 获取ell元素
  var ell = document.getElementById('ell')
  // 构造观察ell元素的实例
    var observer = new MutationObserver(function (mutationsList) {
        // mutationsList参数是个MutationRecord对象数组，描述了每个发生的变化
        mutationsList.forEach(function (mutation) {
            var target = mutation.target;
            if (!target || !target.render) {
                return;
            }
            // 变化的类型
            switch(mutation.type) {
              case 'characterData':
                // 文本内容变化
                target.render();
                break;
              case 'attributes':
                // rows属性值发生了变化
                target.render();
                break;
            }
        });
    });
    
    // 开始观察ell元素并制定观察内容
    observer.observe(ell, {
        attributes: true,
        subtree: true,
        characterData: true,
        attributeFilter: ['rows']    
    });
   ```

- ES6有什么新特性
- 数组的一些常用方法：答了shift\unshift\pop\push(忘记说了XDD)、splice
  实际常用的有：
  - concat
  - join
  - push\pop
  - shift\unshift
  - slice
  - splice
  - map\forEach
  - every\filter\find、entries、values、keys、includes(ES6)
- 深拷贝：JSON、递归深拷贝
- 如果对比2个对象，相等还是相同
- 基本数据类型和复杂数据类型有哪些，都是存储在哪里的：基本数据类型储存在栈、复杂数据类型储存在堆；为什么：读取数据更加方便，尤其针对复杂数据类型
- 异步流程：对比回调地狱答了promise
- fetch和XMLHttpRequest的区别：答了对应的api和什么时候获取数据，**忘记说fetch会返回一个promise了**
- a==1 && a==2，什么时候会成立（这个没想出来，答了一个可能和object有关）
- 重绘和重排是什么，什么时候会发生
- DOM树的结构和渲染流程：树状结构、栅格化和绘入过程
- cookie\localStorage\sessionStorage的区别：储存数据大小，网络请求是否携带，是否会过期等等
- css中 `content`属性是干什么的：`:after、:before`伪元素必需的一条属性，如果不加的话是不会显示的...
- px\em\rem的区别
- BFC是什么，什么时候会触发

- XSS攻击
   **记反了，说成了CSRF攻击...不知道面试官有没有察觉...感觉他还听得津津有味的T^T**
   XSS攻击是html代码中嵌入了script脚本内容，`<div><script>alert(1)</script></div>`, 或者在url参数上拼接了script代码
   **如何防范：对敏感字符进行转义**

   ```javascript
    function escape(str) {
      str = str.replace(/&/g, '&amp;')
      str = str.replace(/</g, '&lt;')
      str = str.replace(/>/g, '&gt;')
      str = str.replace(/"/g, '&quto;')
      str = str.replace(/'/g, '&#39;')
      str = str.replace(/`/g, '&#96;')
      str = str.replace(/\//g, '&#x2F;')
      return str
    }
    ```

- 有什么想问的嘛？
  在ZOOM这家公司里，前端主要负责哪些工作：还技术债、目前前后端还未分离，做工程化、组件化抽离开发（带有公司风格的）

### 二面：用人经理面试

简单聊了聊 因为关于前端的都已经面好了，所以给出了几道算法题，其中有一题记得之前看到过，但是一直没再温习（主要是也用不到），并没有答上来

- 有100层楼，手中有2个鸡蛋，问：如何才能找到鸡蛋仅会被摔碎的那一层
  这个题其实是考察算法里的__动态规划的问题__，有兴趣的可以在网上找找答案

### 三面：HR面试

主要讲了公司的核心价值观，但是在HR这一面并未涉及薪资等问题，说是如果这一面过了还要再安排分公司大boss面（可惜给的消息是综合考虑-薪资问题，此面就结束掉了）

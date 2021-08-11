# React

官方网站：<https://react.docschina.org/docs/hello-world.html>

React 小书： <http://huziketang.mangojuice.top/books/react/>

## 常见内容

1.React 平时怎么绑定事件的？函内绑定和成员的箭头函数绑定有什么区别？如果是在 `constructor`里 bind 绑定呢？

- 在render中的元素处绑定事件，分别：绑定函数式绑定一个箭头函数、bind函数、`constructor`时bind函数；
- 函数内绑定：相当于在dom处绑定，因为都是在render中，所以每一次render都是执行一次bind函数（执行开销）
- 箭头函数绑定：每次render时，都会生成一个新的箭头函数（创建开销）
- 如果是在`constructor`中bind绑定，那么在执行中它只在构造函数中渲染一次，也就是 实例化的时候执行一次，只一次。

2.React 常用的 hook 有什么？

- `useState`: `const [count, setCount] = useState(0)`
- `useEffect`
- `useCallback`
- `useRef`
- `useMemo`

3.`useMemo` 平时都怎么用的？

4.平时做过哪些 React 优化？怎么定位问题，如何优化？

- 使用`Memo`优化无需每次都要渲染的组件

5.hook 解决了什么问题？为什么有 hook

它的出现让函数组件拥有了类似class组件的能力（生命周期等），同时也优化了一些过去的缺点

6.了解合成事件吗？是什么？为什么需要合成事件？（解决什么问题？）

- React 合成事件:
    React有自己的一套事件处理机制，通过合成事件的机制实现事件处理。
    React并没有把`on*`事件直接挂载在真实DOM上，而是在document处监听所有支持的事件，当事件发生并且冒泡=>document处，React将事件内容进行封装并交由真正的处理函数运行。
    封装的这一步就是在：`syntheticEvent 事件池`处
    ![react-event](https://tva1.sinaimg.cn/large/00831rSTgy1gcgrfyk903j30y00esads.jpg)
    > SyntheticEvent 是合并而来。这意味着 SyntheticEvent 对象可能会被重用，而且在事件回调函数被调用后，所有的属性都会无效。出于性能考虑，你不能通过异步访问事件。
- 为什么需要合成事件：
    如果DOM上绑定了过多的事件处理函数，整个页面响应以及内存占用可能都会受到影响。
    避免DOM事件滥用，同时确保多端浏览器事件处理机制统一（兼容性），React则使用SyntheticEvent进行了中间层接管,在事件合成层进行处理
- 如何在React使用原生事件
    原生事件需要绑定在真实的DOM上，所以这个时候DOM需要被渲染出来，在声明周期 `componentDidMount` 进行绑定

    ```javascript
    class Demo extends React.PureComponent {
        componentDidMount (){
            const $this = ReactDom.findDomNode(this);
            $this.addEventListener('click', this.onDomClick, false);
        }
        
        onDomClick = ()=>{
            //...
        }
        
        render () {
            return (
                <div>Demo Div</div>
            )
        }
    }
    ```

- 如何在React中 合成事件和原生事件 混用

    ```javascript
        class Demo extends React.PureComponent {
            componentDidMount() {
                const $this = ReactDOM.findDOMNode(this)
                $this.addEventListener('click', this.onDOMClick, false)
            }

            onDOMClick = evt => {
                console.log('dom event')
            }

            onClick = evt => {
                console.log('react event')
            }

            render() {
                return (
                    <div onClick={this.onClick}>Demo</div>
                )
            }
        }

    ```

    响应顺序：DOM真实事件触发=>冒泡至document=>React合成事件
    阻止冒泡，如果在DOM原生事件上阻止冒泡`event.stioPropagation()`，那么合成事件就不会触发了

7.循环里的 key 有什么用？为什么一定要加？

减少diff算法时对比virtual dom 的开销，以及避免渲染时发生意外情况，比如dom节点意外不更新等

8.平时状态管理工具用什么？怎么选型的？为什么？redux 和 mobx 什么区别？

- 平时使用redux，根据熟悉程度进行选择即可，没有什么必须是要用的

- 管理数据的方式不同，redux是通过单项数据流的flux思想构建的，mobx则不是

9.什么是高阶组件？

高阶组件HOC，简单讲就是将一个组件作为参数传入另外一个组件，在这个组件内对其进行某些操作后，再返回这个组件

10.redux 的 connect 是什么？为什么需要 connect？

内部组件connect进行连接，它是一个高阶函数HOC，在redux内部进行hook，然后根据你提供的`mapStateToProps`取出整个state，供你使用

11.PureComponent 和 React.memo 有什么区别？

12.context 是什么？用过吗？怎么用的？

13.ref 用过吗？什么场景？

ref可以获取dom节点的信息，可以用来获取dom高度，input自动聚焦等。

14.react-router 原理是什么？和 vue-router 什么区别？什么是动态路由，什么是静态路由？有什么区别？

15.setState 什么时候是异步，什么时候是同步？

- React 其实会维护着一个 state 的更新队列，每次调用 setState 都会先把当前修改的 state 推进这个队列，在最后，React 会对这个队列进行合并处理，然后去执行回调。根据最终的合并结果再去走下面的流程（更新虚拟dom，触发渲染）。
- `setTimeout`中调用以及原生事件中调用的话，是可以立马获取到最新的state的。根本原因在于，setState并不是真正意义上的异步操作，它只是模拟了异步的行为。React中会去维护一个标识（`isBatchingUpdates`），判断是直接更新还是先暂存state进队列。`setTimeout`以及原生事件都会直接去更新state，因此可以立即得到最新state。而合成事件和React生命周期函数中，是受React控制的，其会将`isBatchingUpdates`设置为`true`，从而走的是类似异步的那一套。
- **总结：**
  - `setState` 在合成事件、钩子函数中是“伪异步”的，在原生事件和`setTimeout`中都是同步的
  - `setState` 的**伪异步**并不是通过异步代码实现的，而是因为合成事件、钩子函数的调用顺序在更新之前，导致合成事件和钩子函数没法立刻拿到更新后的值，形成了伪异步
  - `setState`的批量更新也是建立在“伪异步”（合成事件、钩子函数）之上的，在原生事件和`setTimeout`中不会批量更新。如果在“伪异步”中对同一个值进行多次`setState`，`setState`的**批量更新策略**会对其进行覆盖，取最后一次执行；如果同时`setState`多个不同的值，在更新时会对其进行合并批量更新。

16.为什么一定要 super(props)

- JavaScript中，`super`是父类`constructor`的引用。
- 如果不`super(props)`，是无法正常使用`this`的 => `undefined`
- 一定要传`props`吗？如果只`super()`可以吗？
  - 可以，但是不建议，因为React如果发现我们没有在super中传props，那么它会替我们的组件设置`props`属性，虽然`props`可以拿到值，但是`this.props`在`constructor`中却会一直都会是`undefined`

```javascript
// Inside React 
class Component { 
    constructor(props) { 
    this.props = props; 
    // ...
    } 
} 

// Inside your code 
class Button extends React.Component { 
    constructor(props) { 
        super(); // 😬 We forgot to pass props 
        console.log(props); // ✅ {} 
        console.log(this.props); // 😬 undefined 
    } 
    // ... 
}

class Button extends React.Component { 
    constructor(props) { 
        super(props); // ✅ We passed props 
        console.log(props); // ✅ {} 
        console.log(this.props); // ✅ {} 
    } 
    // ... 
}

```

>ps:当有了class 属性提案(class fields proposal)，大部分的坑都会消失。在没有标明constructor的情况下，全部参数会被自动传入。这样就允许像state = {}的表达式，如果有需要this.props或者this.context将同样适用。Hooks中，我们甚至不需要super或者this。

```javascript
// 旧版
class Checkbox extends React.Component { 
    constructor(props) { 
        super(props); 
        this.state = { isOn: true }; 
    } 
    // ... 
}

// class属性提案后
class Checkbox extends React.Component { 
    state = { isOn: true }; 
    // ... 
}
```

17.React 是如何 rerender 的？（得略懂源码，比如 diff vdom，然后判断是否要 render）

18.mobx 和 redux 原理是什么？（你工作用什么就看什么，有时间就都掌握）

19.React 是如何 diff的？什么样的策略？

20.fiber 是什么？

21.React 的一些TS类型问题。`React.Element`/`React.ComponentType`/`React.ReactNode`/`JSX.Element`/`Element`
构建 react

22.如何用js表示一个dom

```javascript
{
    tag: 'div',
    attrs: { className:'box', id: 'content' },
    children: [
        {
            tag: 'div',
            attrs:{ className: 'title'},
            children: ['Hello']
        },
        {
            tag: 'button',
            attrs: null,
            children: ['Click']
        }
    ]
}

// 表示的是：
<div class='box' id='content'>
  <div class='title'>Hello</div>
  <button>Click</button>
</div>

```

23. `React.PureComponent` 和 `React.memo` 的区别

> 继承了PureComponent，进行的就是“浅”比较，它是通过Prop和State的浅比较来实现的shouldComponentUpdate.
> PureComponent不仅会影响本身，而且会影响子组件，所以PureComponent最佳情况是展示组件，也就是“纯”组件。

- `React.PureComponent` 适用于class组件，是一个封装了对比机制的普通组件
- `React.memo` 适用于函数组件，是一个高阶组件

24. 为什么要弃用`ComponetWillreceiveProps`

    1.class 组件本身就不建议将 props 的数据保存一份到state 中，这样会导致 state 和 props 的数据耦合起来；
    2.这个方法可以使用 this 来操作，可能会存在某些使用 setState 的神奇脑回路使得无限循环；
    3.所以后面用静态的 `static getDerivedStateFromProps` 来收缩这个时间钩子的作用，让他真的需要通过 props 派生 state 的时候才用，一般时候不用就不用了

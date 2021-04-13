# Redux

## Flux 和 Redux

Flux是一种架构思想，可以把它看做一种应用程序中**数据流**的设计模式；Flux应用中的数据以单一方向流动。

![Flux](https://tva1.sinaimg.cn/large/00831rSTgy1gcozvt3g5xj31tk0jyq6d.jpg)

但是这个时候我们不讲太多Flux的内容，你只需要知道，Redux是基于Flux架构思想设计的，但是它却和Flux又有不同，你先了解了Flux之后再去学习Redux会有理论铺垫，但是如果你对它了解不多也不会对你学习Redux有太大的影响。

![Flux&Redux](https://tva1.sinaimg.cn/large/00831rSTgy1gcozhmtecsj31ec0s8nhe.jpg)

### Flux 的特点

- **单向数据流**。视图事件或者外部测试用例发出 Action ，经由 Dispatcher 派发给 Store ，Store 会触发相应的方法更新数据、更新视图
- **Store 可以有多个**
- Store 不仅存放数据，还封装了处理数据的方法

### Redux 的特点

- **单向数据流**。View 发出 Action (`store.dispatch(action)`)，Store 调用 Reducer 计算出新的 state ，若 state 产生变化，则调用监听函数重新渲染 View （`store.subscribe(render)`）
- **单一数据源**，只有一个 Store
- state 是只读的，每次状态更新之后只能返回一个新的 state
- 没有 Dispatcher ，而是在 Store 中集成了 dispatch 方法，**`store.dispatch()` 是 View 发出 Action 的唯一途径**
- 支持使用中间件（Middleware）管理异步数据流


## React 和 Redux

React 中有个非常重要的概念： **组件化**，在项目中对业务代码进行抽离，形成组件。通过“组件+组件”的形式构成整个项目的核心代码。那么 **组件通信** 则会是我们经常遇到的事情，如果组件树层级过多且对其中某个维护的值进行读取或操作，将会变得十分麻烦。

如果是这种情况，你可以考虑使用一下 **Redux**。

![props](https://tva1.sinaimg.cn/large/00831rSTgy1gcoocqi5omj31i40syjv4.jpg)

Redux更多的是遵循Flux模式的一种实现，是一个JavaScript库，它关注点主要是以下几方面：

1. Action：一个JavaScript对象(纯对象)，描述动作相关信息，可以把它当做<span style="color:red">**规则列表**</span>，主要包含type属性和payload属性： 
   1. type：action 类型；
   2. payload：负载数据；
2. Reducer：一个没有副作用的纯函数，定义应用状态如何响应不同动作（action），如何更新状态，可以把它当做<span style="color:red">**响应列表**</span>；
3. Store：管理action和reducer及其关系的对象，可以把它当做<span style="color:red">**中轴系统**</span>，主要提供以下功能： 
   1. 维护应用状态并支持访问状态（getState()）；
   2. Dispacher：调度器，支持监听action的分发，更新状态（dispatch(action)）；
   3. 支持订阅store的变更（subscribe(listener)）；
   4. 项目中只有唯一一个Store
4. 异步流：由于Redux所有对store状态的变更，都应该通过action触发，异步任务（通常都是业务或获取数据任务）也不例外，而为了不将业务或数据相关的任务混入React组件中，就需要使用其他框架配合管理异步任务流程，如`redux-thunk`，`redux-saga`等；

所以，如果我们简单描述一下Redux的数据流向，就是**中轴系统Store** 提供**数据获取state** 和 根据**规则列表action**判断应该执行哪些**响应reducer**，然后再将响应后的数据传递给视图层view。当然这个过程中除了这几个大方向的内容还会有很多细节。

### Demo实践

#### 安装依赖

通过npm或者yarn安装我们所有要使用的依赖

`npm i redux react-redux --save`

从这一步我们会明确一件事情：

- redux是核心主体，它不会限制你当前的框架语言是什么，不论是react还是vue，甚至node都是可以使用 redux的
- react-redux 是配合react使用的，它提供了很多方法帮助你把state和react连接起来

#### 创建Store & reducer
`/store/Store.js`

  ```javascript
  import { createStore } from "redux";
  import { INCREMENT, RESET } from "./actions.js";	// 引入actions列表的内容
  
  // 初始化state值
  const initialState = {
  	count: 0
  }
  
  // reducer 响应列表，根据action.type的不同来做不同的操作
  const reducer = (state = initialState, actions) => {
    switch(actions.type){
      case "INCREMENT":
        return {
          ...state,
          count: state.count +1
        };
  
      case "RESET":
        return {
          ...state,
          count: 0
        };
      default:
        return state
    }
  }
  
  // 创建一个中轴系统store
  // createStore 的第一个参数： reducer 响应列表
  export const Store = createStore(reducer);
  ```

#### 创建actions
`/store/actions.js`

  接下来单独创建一个文件来预设好我们规定的规则列表，Actions 的格式非常自由。只要它是个带有 `type` 属性的对象就可以了。

  ```javascript
  // const 定义保证actions.type的不变性
  export const INCREMENT = "INCREMENT";
  export const RESET = "RESET";
  export const FETCH_DATA_BEGIN = "FETCH_DATA_BEGIN";
  export const FETCH_DATA_SUCCESS = "FETCH_DATA_SUCCESS";
  export const FETCH_DATA_FAILURE = "FETCH_DATA_FAILURE"
  
  export function increment (){
    return { type: INCREMENT }
  }
  
  export function reset (){
    return { type: RESET }
  }
  ```

  目前，我们有：**Store、actions、reducer**，我们先实验一下在Store.js中实验一下，看一下Store到底是怎么做事情的（Store.dispatch(action)）

  我们给Store.js中最后加一行`Store.dispatch({ type: INCREMENT});`对Store中存储的state.age进行了一次操作，那么这个时候state中的age将会从25变为26

#### Provider接入应用的总入口
业务入口`App.js`

  在这一步我们需要使用 `react-redux`将redux和react进行连接，使react可以访问redux中的内容。

  ` react-redux`提供了一个组件：`Provider` 组件和 `connect`函数

  > 通过用 `Provider` 组件包装整个应用，应用树里的**每一个组件**都可以访问 Redux store。
  > >
  > > 在 `App.js` 里，引入 `Provider` 然后用它把 `Index` 的内容包装起来。`store` 会以 prop 形式传递。
  > >
  > > 这样之后，包裹元素的 子元素，以及子元素的子元素等等——所有这些现在都可以访问 Redux stroe。

  ```javascript
  import React, { Component } from "react";
  import { Provider } from "react-redux";
  import { Store } from "./sore/Store";
  import { Index } from "./page/index";
  import "./index.less";
  
  export default class App extends Component {
    render(){
      return (
      	<Provider store={Store}>
        	<Index />
        </Provide>
      )
    }
  }
  ```

  **BUT： 但这不是自动的，我们还需要在内部组件内使用`connect`函数进行连接**

#### connect连接业务组件
内部组件`Index.js`

  使用`connect`进行连接， `connect` 是一个**高阶函数**，它简单说就是当你调用它时会返回一个函数。然后调用**返回的**函数传入一个组件时，它会返回一个新（包装的）组件。

  `Connect` 做的是在 Redux 内部 hook，取出整个 state，然后把它传进你提供的 `mapStateToProps` 函数。它是个自定义函数，因为只有**你**知道你存在 Redux 里面的 state 的“结构”。

  ```javascript
  import React, { Component } from "react";
  import { Store } from "../store/Store";
  import { increment, reset, fetchData} from "../store/actions"
  import { connect } from "react-redux";
  import "./index.less";
  
  class Index extends Component {
    constructor() {
      super();
      this.state = {
        count: 0
      };
    }
  
    componentDidMount() {
      console.log("props", this.props);
    }
  
    handleAdd = () => {
      // 通过dispatch一个action，告诉Store按这个action.type去reducer中查看下怎么操作数据吧！
      // 紧接着Store每dispatch一次，都会执行reducer函数，Store 就会去做对应的操作了
      // this.props.dispatch(increment());
      this.props.increment();
    };
  
    handleReset = () =>{
      // this.props.dispatch(reset());
      this.props.reset();
    }
  
    render() {
      const { count } = this.props;
      return (
        <div className="page-index">
          <div className="content">{count}</div>
          <button onClick={this.handleAdd}>ADD</button>
          <button onClick={this.handleReset}>Reset</button>
        </div>
      );
    }
  }
  
  // store 中state 对 当前组件props的映射，告诉store你要从它那里取什么值
  function mapStateToProps(state){
    return {
      count: state.count,
    }
  }
  
  // connect dispatch
  // 这样dispatch 就会挂载到this.props上，执行时 会自动 执行  this.props.dispatch(actions)
  const mapDispatchToProps = {
    increment,
    reset,
  }
  
  // connect首先接收2个函数，这2个函数是用来做映射的；
  // 映射state中的某个值到props；映射dispatch方法到props上
  export default connect(mapStateToProps, mapDispatchToProps)(Index)
  ```



### React-Redux Provider 工作机制

`Provider` 可能看起来有一点点像魔法。它在底层实际是用了 React 的 [Context 特性](https://daveceddia.com/context-api-vs-redux/)。

Context 就像是连接每个组件的秘密通道，使用 `connect` 就可打开秘密通道的大门。

想象一下，在一堆煎饼上浇糖浆，即使你只在最上层倒了糖浆，那糖浆也会**渗入**到其他的煎饼上。`Provider` 对 Redux 做了同样的事情。



### 结合Redux Thunk进行网络请求

如果需要在Redux中进行网络请求，那么需要结合一些`Redux`的中间件去实现。因为我们可以发现，在actions中，都是一些纯对象，`Redux`的机制就是这么要求的。但是一些minddleware可以帮助我们实现复杂actions，比如api请求等。`Redux Thunk`就可以帮助返回一个处理业务的函数实现复杂actions
- 安装新的依赖：react-thunk，`npm install --save redux-thunk`
- 调整Store 中轴系统:在 index.js（或者其他你创建 store 的地方），引入 redux-thunk 然后通过 Redux 的 applyMiddleware 函数把它应用到 store 中。

  ```javascript
  import { creatStore, applyMiddleware } from "redux"; // 引入applyMiddleware
  import thunk from "redux-thunk";	// 引入thunk
  import { INCREMENT, RESET } from "./actions.js";	// 引入actions列表的内容
  
  // 初始化state值
  const initialState = {
  	count: 0
  }
  
  // reducer 响应列表，根据action.type的不同来做不同的操作
  const reducer = (state = initialState, actions) => {
  	//...
  }
  
  // 创建一个中轴系统store
  // createStore 的第一个参数： reducer 响应列表
  // 第二个参数：使用中间件并且包裹thunk
  export const Store = createStore(reducer, applyMiddleware(thunk));
  ```

- 为了代码结构清晰，再创建一个`dataActions.js`

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

  其实可以在整个过程看到，我们通过这个fetchData actions 返回了一个dispatch 并且 接下来依次执行

  - 第一个dispatch：`fetchDataBegin()`
  - 请求数据
  - 第二个`dispatch：fetchDataSuccess()`
  - 或者 `dispatch: fetchDataFailure()`

  那么接下来再去reducer中配置与之相对应的响应规则就好了，这样当我们`dispatch(fetchData())`时就会分别有响应的操作了：

- 为了结构清晰，我们也再次创建一个`dataReducer.js`

  ```javascript
  import {
    FETCH_PRODUCTS_BEGIN,
    FETCH_PRODUCTS_SUCCESS,
    FETCH_PRODUCTS_FAILURE
  } from "./dataActions";
  
  export default function dataReducer(state, action) {
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
        // 既然失败了，我们没有数据可以展示，因此要把 `items` 清空。
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

- 这个时候我们联合上面的Index.js代码，发现我们可能会有了多个reducer，那么我们需要把多个reducer进行合并，使用`redux`的`combineReducers`进行<span style="color:red">**合并**</span>，先创建一个`rootReducer.js`文件

  ```javascript
  import { combineReducers } from "redux";
  import dataList from "./dataReducer";
  import { reducer } from "./Store"
  
  export default combineReducers({
    dataList,
    normal: reducer
  });
  ```

- 在Store中引入 合并后的 `根reducer`

  ```javascript
  import rootReducer from './rootReducer';
  
  // ...
  
  const store = createStore(rootReducer, applyMiddleware(thunk));
  ```

- 业务代码中的使用`Index.js`

  ```javascript
  import React, { Component } from "react";
  import { Store } from "../store/Store";
  import { increment, reset, fetchData} from "../store/actions"
  import { connect } from "react-redux";
  import "./index.less";
  
  class Index extends Component {
    constructor() {
      super();
      this.state = {
        count: 0
      };
    }
  
    componentDidMount() {
      // 考虑到是要请求api，所以放在componentDidMount 或者 Hook的 useEffect
      this.props.fetchData();
    }
  
    handleAdd = () => {
      // ...
    };
  
    handleReset = () =>{
      //...
    }
  
    render() {
  	// ...
    }
  }
  
  // store 中state 对 当前组件props的映射，告诉store你要从它那里取什么值
  function mapStateToProps(state){
    return {
      count: state.normal.count,	// count所在的reducer被合并时包裹在了 normal对象中
      data: state.dataList.data
      
    }
  }
  
  // connect dispatch
  // 这样dispatch 就会挂载到this.props上，执行时 会自动 执行  this.props.dispatch(actions)
  const mapDispatchToProps = {
    increment,
    reset,
    fetchData // 新的action不要忘记映射进去哦
  }
  
  // connect首先接收2个函数，这2个函数是用来做映射的；
  // 映射state中的某个值到props；映射dispatch方法到props上
  export default connect(mapStateToProps, mapDispatchToProps)(Index)
  ```



### Redux 中处理错误

这里的错误处理比较轻量，但是对大部分调用 API 的 actions 来说基本结构是一样的。基本观点是：

1. 当调用失败时，dispatch 一个 `FAILURE action`
2. 通过设置一些标志变量和/或保存错误信息来处理 reducer 中的 FAILURE action。
3. 把错误标志和信息（如果有的话）传给需要处理错误的组件，然后根据任何你觉得合适的方式渲染错误信息。

### Store的API
Redux 有五个 API，分别是：
- `createStore(reducer, [initialState])`
- `combineReducers(reducers)`
- `applyMiddleware(...middlewares)`
- `bindActionCreators(actionCreators, dispatch)`
- `compose(...functions)`

createStore 生成的 store（应用状态 state 的管理者） 有四个 API，分别是：
- `getState()`  获取整个 state
- `dispatch(action)`   触发 state 改变的【唯一途径】
- `subscribe(listener)` 您可以理解成是 DOM 中的 addEventListener，一旦State发生变化，就会自动执行这个函数，store.subscribe返回一个函数，调用这个函数就可以解除监听

  ```javascript
  import { createStore } from 'redux';
  const store = createStore(reducer);
  
  // 只要把 View 的更新函数（对于 React 项目，就是组件的render方法或setState方法）放入listen，就会实现 View 的自动渲染。
  store.subscribe(listener);
  
  // 解除监听
  let unsubscribe = store.subscribe(()=>{
    console.log(store.getState())
  })
  unsubscribe();
  ```

- `replaceReducer(nextReducer)` 一般在 Webpack Code-Splitting 按需加载的时候用

## Redux的工作流程

经过上面的铺垫，我们重新梳理一下Redux的工作流程：

![](https://tva1.sinaimg.cn/large/00831rSTgy1gcr986m48gj30hq0dbt90.jpg)

1. 用户通过某个动作或时机发出Action

   ```javascript
   store.dispatch(action)
   ```

2. store 自动调用Reducer，并且传入2个参数：当前State 和 收到的Action。Reducer会经过计算后返回新的State。

3. State一旦有变化，Store就会调用监听函数，在监听函数里你可以重新获取State的值并进行setState（React中），这个时候就会触发重新渲染View

   ```javascript
   // 设置监听函数
   store.subscribe(listener);
   
   function listerner() {
     let newState = store.getState();
     component.setState(newState);   
   }
   ```

## 参考文章

[[译]2019 React Redux 完全指南](https://juejin.im/post/5cac8ccd6fb9a068530111c7#heading-6)

[在 React 中使用 Redux](https://juejin.im/post/5b755537e51d45661d27cdc3#heading-0)


## Redux 进阶

[https://github.com/kenberkeley/redux-simple-tutorial/blob/master/redux-advanced-tutorial.md](https://github.com/kenberkeley/redux-simple-tutorial/blob/master/redux-advanced-tutorial.md)

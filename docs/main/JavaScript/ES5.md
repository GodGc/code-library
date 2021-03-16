# ES5

## 作用域、闭包、递归

作用域([[Scope]])就是变量与函数的可访问范围，即作用域控制着变量与函数的可见性和生命周期。

#### 全局作用域

全局变量：

- window上挂在的变量
- 使用var 关键字声明的变量
- 未声明，但直接赋值的变量

#### 块级作用域

块级作用域可通过let和const声明，声明后的变量再指定块级作用域外无法被访问。

- 在一个函数内部
- 在一个代码块内部

特点：

- 变量的声明不会提升到代码块顶部，只有声明且赋值后才会被创建
- 禁止重复声明
- for循环中声明的变量尽在循环内部使用

#### 作用域链

当所需要的变量在所在的作用域中查找不到时，它会一层一层向上查找，直到找到全局作用域，如果还没有找到，就放弃查找。这种一层一层的关系，叫做作用域链。

#### 闭包

定义：函数A返回一个函数B，并且函数B中使用了函数A中的变量，函数B就被成为闭包

```javascript

function A() {
  let a = 1
  function B() {
      console.log(a)
  }
  return B}
  
```

经典面试题，循环中使用闭包解决 var 定义函数的问题

```javascript
// 这个方法还涉及了 js的任务队列，setTimeout是异步的，循环完毕之后才会执行，所以如果不处理就会打印一堆6

for ( var i=1; i<=5; i++) {
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
}
        
// 闭包方法
for (var i = 1; i <= 5; i++) {
  (function(j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
    })(i);
}
  
// 使用settimeout第三个参数

for ( var i=1; i<=5; i++) {
    setTimeout( function timer(j) {
        console.log( j );
}, i*1000, i);}

// 另外的方式就是使用let声明i
for( let i = 1; i<=5; i++){
    console.log(i);
}
```

##### 闭包的缺点：内存泄漏（一个对象在不需要它的时候仍然存在）

#### 递归

至于递归的话，就是函数自身调用自己本身，需要注意的是要设置好打断条件，不然会陷入死循环，导致卡死。

## call、apply、bind

call 和 apply 都是为了解决改变this的指向，只是传参的方式不同。

- call 第二个参数接收一个参数列表：多个参依次传入
- apply 第二个参数接入一个参数数组：参数柯里化
- bind 也可以改变this的指向，但是它返回的是一个函数
- 哪个性能更优？**call**

```javascript

let a = {
    value: 1
}
function getValue(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value
)}
getValue.call(a, 'yck', '24')
getValue.apply(a, ['yck', '24'])
```

#### 实现一个call

```javascript
Function.prototype.myCall = function (context){
    var context = context || window
    // 调用者是个函数
    // 通过赋值让这个函数 挂载到传入值中，相当于添加了一个方法进去
    // 然后执行，相当于把调用者的函数原封不动的增加到传入值的代码体中
    // this 其实就是调用者的函数体
    context.fn = this
    console.log(context.fn)
    var args = [...arguments].slice(1)
    var result =context.fn(...args)
    delete context.fn
    return result
}
```

#### 实现一个apply

```javascript
Fucntion.prototype.myApply = function (context) {
    var context = context || window;
    context.fn = this;
    var result;
    // 判断是否传入第二个参数
    if (arguments[1]){
        result = context.fn(...arguments[1])
    }else{
        result = context.fn()
    }
    delet context.fn
    return result
}
```

#### 实现bind

```javascript

Function.prototype.myBind = function (context) {
    if(typeof this !== 'function'){
        throw new TypeError('Type error')
    }
    var _this = this;
    var args = [...arguments].slice(1)
    // 返回一个函数
    return function F(){
        // 因为返回了一个函数，我们可以 new F()，所以需要判断
        if(this instanceof F){
            return new _this(...args, ...arguments)
        }
        return _this.apply(context, args.concat(...arguments))
    }
}

```

## Event loop 事件循环机制

blog总结：[http://www.godrry.com/archives/the-synchronous-asynchronism-of-event-loop.html](http://www.godrry.com/archives/the-synchronous-asynchronism-of-event-loop.html)

（1）所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。
（2）主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
（3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
（4）主线程不断重复上面的第三步。

Event Loop(事件循环)：正是因为主线程不断的去任务队列(task queue)中读取事件,所以才有了事件的不断循环,也就是说当前主线程中的同步事件执行完毕后,主线程才会去任务队列中读取异步事件,而且这个过程会一直重复下去,这就是事件循环。

常见的异步任务队列：

- 微任务
  - promise
  - process.nextTick
  - Object.observe
  - MutationObserver

- 宏任务
  - script
  - 定时器 setTimeout setInterval
  - setImmediate
  - I/O
  - UI rendering

**一般来说微任务先于宏任务执行，但是有个例外就是script，它要先执行才能有其他的微任务**

所以正确的一次Event loop顺序：

- 第一轮Event loop
    1. 执行同步代码 => 宏任务
    2. 执行栈为空，查询是否有微任务需要执行
    3. 执行所有微任务
    4. 必要的话渲染UI => 宏任务
- 然后开始下一轮Event loop，执行宏任务中的一步代码

## 事件流、事件代理

#### 事件触发三阶段

- window往事件触发处传播，遇到注册的捕获事件会触发=> 向下捕获
- 传播到事件触发处时触发注册事件 => 捕获到
- 从事件触发处往window传播，遇到注册的冒泡事件会触发 => 向上冒泡

`addEventListener` 的第三个参数如果是一个参数值则是 useCapture：true/false,默认为false（捕获），决定注册的是捕获还是冒泡
也可以是一个对象参数：

- capture，布尔值，和 useCapture 作用一样
- once，布尔值，值为 true 表示该回调只会调用一次，调用后会移除监听
- passive，布尔值，表示永远不会调用 preventDefault

#### 事件代理

如果一个节点中的子节点是动态生成的，那么子节点需要注册事件的话应该注册在父节点上

```html

<ul id="ul">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
</ul>
<script>
  let ul = document.querySelector('##ul')
  ul.addEventListener('click', event => {
    console.log(event.target);
    // 判别该对象的type，然后进行事件绑定
    if(event.target == 'xxx){
        // do something
    }
  })
</script>
```

**事件代理的好处**

- 节省内存
- 不需要给子节点注销事件
- 动态生成的子节点也可以拥有注册事件

对于事件监听或者注册事件来说的话一般使用以下api

- onClick、onXXX等
- addEventListener

## 原型链

![原型链](http://www.godrry.com/usr/uploads/2019/05/1176445768.jpg)
每个函数都有有一个`prototype`的属性（原型对象）

- prototype是一个**显式原型属性**，它指向原型

每个对象都有一个`__proto__`属性（原型链最后一步）

- `__proto__`是一个**隐式原型属性**, 指向了创建该对象的构造函数的原型(prototype)
- 对象可以通过__proto__来寻找不属于该对象的属性，__proto__将实例对象和构造函数连接起来组成了原型链

**一句话讲清楚原型链：** 实例对象可以通过自身的`__proto__` 属性来链接到构造函数上，使用构造函数上的一些属性，这一寻找过程就是原型链。

## new 的过程

在调用new关键字的时候，实际上是发生了下面四件事情

- 新生成一个对象
- 连接到原型
- 绑定this
- 返回新对象

**自己来实现一下**

```javascript
function create(){
    // 1. 创建一个新对象
   let obj = new Object()
   // 2.1 把类数组对象转为数组对象=> 删除并拿到类数组（参数）的第一项
   let Con = [].shift.call(arguments)
   // 2.2 新对象链接到原型上
   obj.__proto__ = Con.prototype
   // 3. 绑定this
   let result = Con.apply(obj, arguments)
   // 4. 返回新对象
   return typeof result === 'object' ? result : obj
}
```

## new 和 {} 以及 Object.create 的区别

- new 和 {} 可以用来创建一个Object的实例对象, 继承了Object的方法和属性
- Object.create 可以自主的选择要继承的父类是什么，可以是构造函数(Object)，也可以是一个实例对象，也可以是其他 比如null，基于null创建出来的对象Object.create(null)，是一个**非常纯净**的对象，它不会有Object的任何属性和方法，十分纯净
  - Object.create(proto,[propertiesObject])

    ```javascript
    function _inherits(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        subClass.__proto__ = superClass;
    }
    ```

**实现一个Object.create**

```javascript

Object.create = function (obj, properties) { 
    // 新建一个空函数
    function F() {}
    // 空函数原型连接到父类，完成继承
    F.prototype = obj;

    if(properties) {
        Object.defineProperties(F, properties);
    }
    // 返回这个空函数
    return new F();
};
```

## 继承、设计模式

在javascript中，实现继承的最根本思想是**原型链**。

### ES5中的两种经典继承

#### 组合继承

这样避免了单独使用原型链和构造函数的缺陷：一旦修改了prototype，则构造函数中的也会发生改变

```javascript
//构造函数继承实例属性(当然也可以有方法，不过不建议这么做)
function Phone(name){
    this.name = name;
    this.label=["全面屏","5G通信"];
}
//原型链继承原型属性和方法
Phone.prototype.colors=["red","blue","green"];
Phone.prototype.takePhoto = function(){
    console.log("我是父类的原型上的方法--------拍照ing: "+this.name);
}


function Huawei(name,inch){
    //继承构造函数中的属性
    Phone.call(this,name);
    //子类自己构造函数中的属性
    this.inch = inch;//英寸
}
//继承原型上的属性和方法
Huawei.prototype = new Phone();
Huawei.prototype.constructor = Huawei;
//在原型上添加子类自己的方法或属性
Huawei.prototype.listenMusic = function(){
    console.log("我是子类在原型上添加的方法------听歌ing+ "+this.inch);
}

//以上我们就实现了Huawei继承Phone，并且Huawei也拥有了自己独有的属性inch和方法listenMusic。

//下面进行测试：
var h1 = new Huawei("华为P20",6.0);//实例化
h1.label.push("人脸识别")//操作父类构造函数的属性
console.log(h1.label);
h1.takePhoto();//调用父类原型上的方法
h1.listenMusic();//调用子类添加在原型上的方法
```

#### 寄生组合继承

寄生组合继承：关键点就是理解上文提到的inhert()方法：将父类的原型赋给一个临时对象，子类的原型指向该临时对象，如此得到父类原型上的属性和方法。再通过构造函数组合父类和子类本身上的属性或方法。

`inhert` 方法，实现一下：

```javascript
function inherit(son, father){
    let prototypeObj = Object.create(father.prototype);
    prototypeObj.constructor = son;
    son.prototype = prototypeObj;
}
```

#### ES6中的class继承

ES6中通过Class‘类’这个语法糖实现继承和Java等面向对象的语言在实现继承上已经非常相似，当然只是语法层面相似，本质当然依旧是通过原型实现的。ES6实现继承是通过关键字extends、super来实现继承，和面向对象语言Java一样。
**通过class继承可以继承父类的静态方法**

```javascript
class Person {
    constructor(name, age){
        this.name = name;
        this.age = age;
    }
    sayName(){
        console.log('my name is'+ this.name);
    }
    static sayHello(){
        console.log('hello~~');
    }
}

// 子类继承父类
class Chiness extends Person{
    constructor(name,age,addr){
        super(name,age); //必需先再最前面
        this.addr = addr;
    }
    sayMyaddr (){
        console.log('my addr is' + this.addr)
    }
}

// 使用
var student = new Chiness('xiaoming', 20, 'China')
student.sayName();
student.sayMyaddr();
```

## 防抖、节流

防抖和节流都是为了防止函数多次调用，区别是：

- 防抖在单位时间内只执行一次
- 节流是每一个单位时间执行一次

## 防抖的实现

```javascript

// func是用户传入需要防抖的函数// wait是等待时间
const debounce = (func, wait = 50) => {
  // 缓存一个定时器id
  let timer = 0
  // 这里返回的函数是每次用户实际调用的防抖函数
  // 如果已经设定过定时器了就清空上一次的定时器
  // 开始一个新的定时器，延迟执行用户传入的方法
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }}// 不难看出如果用户调用该函数的间隔小于wait的情况下，上一次的时间还未到就被清除了，并不会执行函数
```

带有立即执行选项的防抖函数

```javascript
// 这个是用来获取当前时间戳的
function now() {
  return +new Date()
}
/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
function debounce (func, wait = 50, immediate = true) {
  let timer, context, args

  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)

  // 这里返回的函数是每次实际调用的函数
  return function(...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }
    // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
    // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
```

## 节流的实现

```javascript

/**
 * underscore 节流函数，返回函数连续调用时，func 执行频率限定为 次 / wait
 *
 * @param  {function}   func      回调函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @param  {object}     options   如果想忽略开始函数的的调用，传入{leading: false}。
 *                                如果想忽略结尾函数的调用，传入{trailing: false}
 *                                两者不能共存，否则函数不能执行
 * @return {function}             返回客户调用函数
 */
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // 之前的时间戳
    var previous = 0;
    // 如果 options 没传则设为空对象
    if (!options) options = {};
    // 定时器回调函数
    var later = function() {
      // 如果设置了 leading，就将 previous 设为 0
      // 用于下面函数的第一个 if 判断
      previous = options.leading === false ? 0 : _.now();
      // 置空一是为了防止内存泄漏，二是为了下面的定时器判断
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      // 获得当前时间戳
      var now = _.now();
      // 首次进入前者肯定为 true
          // 如果需要第一次不执行函数
          // 就将上次时间戳设为当前的
      // 这样在接下来计算 remaining 的值时会大于0
      if (!previous && options.leading === false) previous = now;
      // 计算剩余时间
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      // 如果当前调用已经大于上次调用时间 + wait
      // 或者用户手动调了时间
          // 如果设置了 trailing，只会进入这个条件
          // 如果没有设置 leading，那么第一次会进入这个条件
          // 还有一点，你可能会觉得开启了定时器那么应该不会进入这个 if 条件了
          // 其实还是会进入的，因为定时器的延时
          // 并不是准确的时间，很可能你设置了2秒
          // 但是他需要2.2秒才触发，这时候就会进入这个条件
      if (remaining <= 0 || remaining > wait) {
        // 如果存在定时器就清理掉否则会调用二次回调
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        // 判断是否设置了定时器和 trailing
            // 没有的话就开启一个定时器
        // 并且不能不能同时设置 leading 和 trailing
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
```

## 网络请求 - Ajax

    - 实现
    - 封装
    - 基于axios封装

Ajax请求是通过`XMLHttpRequest`来实现的，XMLHttpRequest是用来做网络请求的。

```javascript
function sendAjax(){
    // 构造一个form数据
    var formData = new FormData();
    formData.append('username', 'foo');
    formData.append('pwd', 'bar');
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.responseType = 'text';
    // 设置请求头
    xhr.setRequstHeader('X-Test', 'one');
    // 创建一个post请求，异步
    xhr.open('POST', '/server', true);
    
    // onload事件只有在readyState状态码=4时才触发，表示请求已完成，且响应就绪
    xhr.onload = function(e){
        if(this.status === 200 || this.status == 304){
            console.log('data', this.responseText)
        }
    }
    xhr.ontimeout = function(e){...}
    xhr.onerror = function(e){...}
    
    // 发送数据
    xhr.send(formData);

}
```

### promise 封装ajax

```javascript

function promiseAjax(url){
    return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequset();
        xhr.open('GET', url, true);
        
        xhr.onload = function(e){
            if(this.status == 200 || this.status == 304){
                resolve && resolve(this.responseText)
            }else{
                reject && reject('error')
            }
        }
    
        xhr.send();
    })
}

let ajax = new promiseAjax('/getapi');
ajax.then(function(value){
    console.log(value)
},function(e){
    console.log('failure', e)
})

```

### 封装axios

```typescript
import axios from 'axios';
import { message } from 'antd';

//request-interceptor
axios.interceptors.request.use(
  config => {
    let url = config.url;
    let flag = url.indexOf('login');
    if (flag == -1) {
      let token = window.localStorage.getItem('isLogin');
      if (token !== 'true') {
        message.warning('您未登录，请登录');
        setTimeout(() => {
          location.href = '#/user';
        }, 1500);
      }
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

// 拦截器
axios.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    return Promise.reject(error);
  }
);

interface IFRequestParam {
  url: string;
  msg?: string;
  config?: any;
  data?: any;
}
/**
 * 公用get请求
 * @param url       接口地址
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const get = ({ url, msg = '接口异常', config }: IFRequestParam) =>
  axios
    .get(url, config)
    .then(res => res.data)
    .catch(err => {
      message.info('网络开小差了~');
      console.log('error', err);
    });

/**
 * 公用post请求
 * @param url       接口地址
 * @param data      接口参数
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const post = ({ url, data, msg = '接口异常', config }: IFRequestParam) =>
  axios
    .post(url, data, config)
    .then(res => res.data)
    .catch(err => {
      message.info('网络开小差了~');
      console.log('error', err);
    });

/**
 * 公用DELETE请求
 * @param url       接口地址
 * @param data      接口参数
 * @param msg       接口异常提示
 * @param headers   接口所需header配置
 */
export const del = ({ url, data, msg = '接口异常' }: IFRequestParam) =>
  axios
    .delete(url, data)
    .then(res => res.data)
    .catch(err => {
      message.info('网络开小差了~');
      console.log('error', err);
    });

```

## 网络请求 - Fetch

Fetch API 提供了一个获取资源的接口（包括跨域）。它类似于 XMLHttpRequest ，但新的API提供了更强大和灵活的功能集。 Fetch 的核心在于对 HTTP 接口的抽象，包括 Request，Response，Headers，Body，以及用于初始化异步请求的 global fetch。

它返回的是一个promise形式

### 使用

fetch 方法接收2个参数

- url：请求地址
- option：配置项
  - method: 请求使用的方法，如 GET、POST。
  - headers: 请求的头信息，包含与请求关联的Headers对象。
  - body: 请求的 body 信息。注意 GET 或 HEAD 方法的请求不能包含 body 信息
mode: 请求的模式，如 cors、 no-cors 或者 same-origin。
  - credentials: 请求的 credentials，如 omit、same-origin 或者 include。为了在当前域名内自动发送 cookie ， 必须提供这个选项。

```typescript

fetch(input?: Request | string, init?: RequestInit): Promise<Response>

fetch(url, options).then(function(response) { 
    // 处理 HTTP 响应 

}, function(error) { 
    // 处理网络错误 

})



fetch('/api/user/CaiCai') 
    .then((res) => { return res.json() }) 
    .then((json) => { console.log(json) })
    .catch((err => { }))


// 终止

const controller = new AbortController(); 
const signal = controller.signal; 
setTimeout(() => controller.abort(), 5000); 

fetch('/api/user/CaiCai', { 
signal, // 在option中加入signal 
method: 'POST', // credentials:'include', 
headers: { 'Content-Type': 'application/json' }, 
body: JSON.stringify({
    name: 'CaiCai', 
    age: '26', 
}) })
    .then((res) => { return res.json() })
    .then((result) => { console.log(result) })
    .catch((err) => { console.log(err) })



```

### 特点

1、fetch返回的是promise对象，比XMLHttpRequest的实现更简洁，fetch 使用起来更简洁 ，完成工作所需的实际代码量也更少
2、fetch 可自定义是否携带Cookie

## 网络请求 - JSONP

**只限于get请求**

```html

<script src="http://domain/api?params=1&params2=2&callback=jsonpFunc"></script>
<script>
    function jsonpFunc(data){
        console.log(data)
    }
</script>

```

**封装**

```javascript
    function jsonp(url, jsonpCallback, success){
        let script = document.createElement('script');
        script.src = url;
        script.async = true
        script.type = 'text/javascript'
        window[jsonpCallback] = function(data){
            success && success(data)
        }
        document.body.appendChild(script)
    }
    
    jsonp('http://xxx', 'callback', function(value){
        console.log(value)
    })
```

## 浅拷贝、深拷贝

### 浅拷贝

```javascript

function shallowClone(source) {
    var target = {}; 
    for(var i in source) { 
        if (source.hasOwnProperty(i)) {
            target[i] = source[i]; 
        } } 
    return target; 
}
```

### 一行代码的深拷贝

```javascript
function cloneJSON(source){
    return JSON.parse(JSON.stringify(source)); 
}
```

## hybird & js 如何调用native接口

客户端和H5页面之间的通信方式主要有2个方式

- native to js
- js to native

### 主要说一下js to native 的这种通信方式

- 拦截Url Schema（假请求）：schema上带着参数，由native去获取
- 拦截 prompt alert confirm：即由 h5 发起 alert confirm prompt，native 通过拦截 prompt 等获取 h5 传过来的数据。
- 注入js上下文，挂载在window对象上(方便快捷)
  - 首先native端注入实例对象到js的window对象上
  - 然后h5端可以调用`window._jsbridge`

## 页面性能的优化

- 减少重绘
- 回流
- 防抖，节流
- 懒加载
- 预加载
- base64
- 压缩
- 骨架屏

## react长列表优化

如果一个列表过长，则会造成页面卡顿，资源占用过多的情况，推荐使用**虚拟列表**来优化这种情况

虚拟列表的原理是：**将数据保存至数组中，只渲染可视窗口的列表元素。当可视区域滚动时，需要根据滚动的位移量，计算出可视区域的元素下标，通过下标来渲染数组元素。**

*如果需要自己实现的话可以使用`react-custom-scrollbars`来获取滚动情况的各个参数来操作。*

现在市面上已经有较为成熟的框架，推荐使用`react-virtualized`:
react-virtualized提供了一些基础组件用于实现虚拟列表，虚拟网格，虚拟表格等等，它们都可以减小不必要的dom渲染。此外还提供了几个高阶组件，可以实现**动态子元素高度**，以及**自动填充可视区**等等。

## react-virtualized的使用（实现动态弹伸）

```javascript
import React from "react";
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from "react-virtualized";
const cache = new CellMeasurerCache({ defaultHeight: 30, fixedWidth: true });
const list = new Array(100).fill("wala");

function cellRenderer({ index, key, parent, style }) {
    console.log(index);
    return (
        <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
            <div style={style}>{list[index]}{index}</div>
        </CellMeasurer>
    );
}
class TestList extends React.Component {
    render() {
        return (
            <div style={{height: '100vh'}} onClick={this.handleOnClick}>
                <AutoSizer>
                    {({ height, width }) => (
                         <List
                            height={height}
                            rowCount={list.length}
                            rowHeight={cache.rowHeight}
                            deferredMeasurementCache={cache}
                            rowRenderer={cellRenderer}
                            width={width}
                        />
                    )}
                </AutoSizer>
            </div>
        );
    }
}

export default TestList;


```

## 数组去重

- 利用数组的indexOf下标属性来查询。

```js
function unique4(arr) {
  var newArr = []
  for (var i = 0; i < arr.length; i++) {
    if (newArr.indexOf(arr[i]) === -1) {
      newArr.push(arr[i])
    }
  }
  return newArr
}
console.log(unique4([1, 1, 2, 3, 5, 3, 1, 5, 6, 7, 4]))
// 结果是[1, 2, 3, 5, 6, 7, 4]
```

- 先将原数组排序，在与相邻的进行比较，如果不同则存入新数组。

```js
function unique2(arr) {
  var formArr = arr.sort()
  var newArr = [formArr[0]]
  for (let i = 1; i < formArr.length; i++) {
    if (formArr[i] !== formArr[i - 1]) {
      newArr.push(formArr[i])
    }
  }
  return newArr
}
console.log(unique2([1, 1, 2, 3, 5, 3, 1, 5, 6, 7, 4]))
```

- 利用对象属性存在的特性，如果没有该属性则存入新数组。

```js
function unique3(arr) {
  var obj = {}
  var newArr = []
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) {
      obj[arr[i]] = 1
      newArr.push(arr[i])
    }
  }
  return newArr
}
console.log(unique2([1, 1, 2, 3, 5, 3, 1, 5, 6, 7, 4]))
```

## 统计数组中出现元素的次数

## 正则判断url路径参数

```javascript
function getQueryByName (url,name) {
    var reg=new RegExp('[?&]'+name+'=([^&#]+)');
    var query=url.match(reg);
    return query?query[1]:null;
}
```

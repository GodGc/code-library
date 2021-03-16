# ES6
## 新特性
- let、const的出现，块级作用域，变量不提升，未声明赋值之前不可使用（暂时性死区）、不允许重复声明
- 箭头函数
- 模板字符串
- promise
- async await
- class
- ...


## 箭头函数特性
- 函数体内的this，就是定义时所在的对象，而不是使用时所在的对象（固定的this）
- 不可以用作构造函数，不可以使用new命令
- 不可以使用arguments对象，如果要用，可以使用rest参数代替


## Promise
作用：解决回调地域、异步操作更友好等
### 基本使用：

- new 一个promise对象，传入一个函数，指定什么时候调用resolve、reject方法
- 链式then，传入2个参数：具体的resolve、reject方法


```javascript
const promise = new Promise(function(resolve, reject){
    // ...some code
    // 比如做一些ajax请求，拿数据
    if(/*异步操作成功*/){
        resoleve(value)
    }else{
        reject(error)
    }
})

promise.then(function(value{
    //success
}, function(error){
    // failure
}))
```

### 实现一个promise

> promise代表一个异步操作的最终结果。与promise的主要互动方式是通过then方法注册回调函数来接收promise的最终值或者promise未完成的原因。

```javascript

const PENDING = "pending"
const RESOLVED = "resolved"
const REJECTED = "rejected"

function MyPromise (fn) {
    let _this = this;
    _this.currentState = PENDING
    _this.value = undefined
    // 保存then中的回调，只有当promise状态为pending时才会缓存，并且每个实例至多缓存1个
    _this.resolvedCallbacks = []
    _this.rejectedCallbacks = []
    
    _this.resolve = function (value){
        if(value instanceof Mypromise){
            // 如果 value 是个 Promise，递归执行
            return value.then(_this.resolve, _this.reject)
        }
        // 异步执行
        setTimeout(()=>{
            if(_this.currentState === PENDING){
                _this.currentState = RESOLVED
                _this.value = value
                _this.resolvedCallbacks.forEach(cb=>cb())
            }
        })
    }
    _this.reject = function(reason){
        setTimeout(()=>{
            if(_this.cuurentState === PENDING){
                _this.currentState = REJECTED
                _this.value = reson
                _this.rejectCallbacks.forEach(cb=>cb())
            }
        })
    }
    
    try{
        fn(_this.resolve, _this.reject)
    }catch(e){
        _this.reject(e)
    }
    
}


// then 方法
MyPromise.prototype.then = function(onResolved, onRejected){
    var self = this
    var promise2
    
    onResolved = typeof onResolved === 'function' ? onResolved : v=>v
    onRejected = typeof onRejected === 'function' ? onRejected : r => thorw r
    
    if(self.currentState === RESOLVED){
        return (promise2 = new MyPromise(function (resolve, reject){
            setTimeout(function(){
                try{
                    var x = onResolved(self.value);
                    resolutionProcedure(promise2, x, resolve, reject)
                }catch(reson){
                    reject(reson)
                }
            })
        })
        )
    }
    
    if(self.currentState === REJECTED){
        return (promise2 = new MyPromise(function(resolve, reject){
            setTimeout(function(){
                try{
                    var x = onRejected(self.value);
                    resolutionProcedure(promise2, x, resolve, reject)
                }catch(reson){
                    reject(reson)
                }
            })
        
        }))
    }
    
    if(slef.currentState === PENDING){
        return (promise = new MyPromise(function (resolve, reject){
            self.resolvedCallbacks.push(function(){
                try{
                    var x = onResolved(self.value);
                    resolutionProcedure(promise2, x, resolve, reject)
                }catch(r){
                    reject(r)
                }
            })
            
            self.rejectedCallbacks.push(function(){
                try{
                    var x = onRejected(self.value);
                    resolutionProcedure(promise2, x, resolve, reject)
                }catch(r){
                    reject(r)
                }
            })
        }))
    }
}


// resolutionProcedure
function resolutionProcedure(promise, x, resolve, reject){
    // x 不能和promise2 相同，避免循环引用
    if(promise2 === x){
        return reject(new TypeErroe("Error"))
    }
    
    // 如果x 为promise，状态为pending 需要继续等待，否则执行
    if( x instanceof Mypromise){
        if(x.currentSatte === PENDING){
            x.then(function(value){
                resolutionProcedure(promise2, value, resolve, reject)
            }, reject)
        }else{
            x.then(resolve, reject)
        }
        return
    }

    // reject 或者resolve 其中一个执行过的话，忽略其他的
    let called = false;
    if(x !== null && (typeof x === "object" || type x === "function")){
        try{
            let then = x.then;
            if(typeof then === "function"){
                then.call(
                    x,
                    y => {
                        if(called) return;
                        called = true;
                        resolutionProcedure(promise2, y, resolve, reject);
                    },
                    e => {
                        if(called) return
                        called = true
                        reject(e)
                    }
                )
            }else{
                resolve(x)
            }
        }catch(e){
            if(called) return
            called = true
            reject(e)
        }
    }else{
        // 如果是基本类型，则执行resolve回调并吐出x值
        resolve(x)
    }

}

```


### 用Promise实现Ajax操作
```javascript

const getJSON = function (url) {
    const promise = new Promise(function(resolve, reject){
        const handler = function (){
            if(this.readyState !==4){
                return;
            }
            if(this.status === 200){
                resolve(this.response)
            }else{
                reject(new Error(this.statusText))
            }
        }
      const client = new XMLHttpRequest();
      client.open('GET', url);
      
      client.onreadystatechange = handler;
      client.responseType = 'json';
      client.setRequestHeader('Accept', 'application/json');
      
      client.send;
      
    })
    return promise;
}


// 调用方法
getJSON('/posts.json').then(function(json){
    console.log('data', json)
}, function(error){
    console.log('ERROR', error)
})
```

### promise的api
- promise.catch => 捕获错误
- promise.finally => 不管最后结果如何都会执行
- promise.all => 将多个promise实例组合成一个新的promise 
    - const p = Promise.all([p1,p2,p3])
    - p1,p2,p3 全部为resolve 才会变成resolve， 有一个是reject 就会变成reject
- promise.race => 也是将多个promise实例组合成一个新的promise
    - const p = Promise.race([p1,p2,p3])
    - 只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。
- promise.any => 像promise.race，但是不会因为某个promise变成reject状态而结束



## 实现一个类
可以on,emit,off,once，注册、调用、取消、注册仅能使用一次的事件


```javascript
class EventEmitter {
    constructor(){
        this._eventpool = {};
    }   
    // 注册
    on (event, callback){
        this._eventpool[event] ? this._eventpool[event].push(callback) : this_eventpool[event] = [callback]
    }
    // 取消
    off (event, callback){
        if(this._eventpool[event]){
            delete this_eventpool[event]
        }
    }
    // 调用
    emit (event, ..args){
        this._eventpool[event] && this._eventpool[eveent].forEach(cb=>cb(...args))
    }
    // 注册仅能使用一次
    once (event, callback){
        this.on(event, ...args=>{
            callback(...args);
            delete this.off(event)
        })
    }
}
```


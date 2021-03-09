# Virtual DOM

>  今天闲来无事，想和大家分享一下React的Virtual DOM 和 diff算法 （React v16前）。



React的函数UI是它的一个标志性特点，通过在jsx文件内的render方法中，我们可以直接编写dom结构。不知道大家是否好奇，jsx其实本质是js，为什么它可以跨越和HTML的鸿沟，直接编写DOM？

__jsx是js的语法糖，而其中编写的DOM结构，都是通过Virtual DOM的方式存在的。__

## 什么是Virtual DOM

顾名思义，虚拟DOM并不是真实的DOM节点数据，而是一个javascript对象，这个对象被React维护着，在组件的`mount`时，该对象会被转化为一组真实的DOM树结构。

![virtual dom](http://tva1.sinaimg.cn/large/ac62c933gy1gd2r0i59wnj20u00g947l.jpg)

从上图可以发现，右侧其实就是我们说的虚拟DOM对象，它的结构很简单，一共有`tagName`、`props`、`children`三个属性，分别对应着：标签名、属性和子节点，真实的DOM就是根据它们创建出来的，创建方式就是我们常见的createElement等等。

## 为什么要使用Virtual DOM？

难道使用虚拟DOM这个技术是因为它的创建和更新速度比原生方法速度更快吗？其实，这个答案并不是绝对的YES，React官方从未提到过它的性能非常高，所以我们不能断言这个结论。

![](http://tvax4.sinaimg.cn/large/ac62c933gy1gd2rrmver1j20u00erjzv.jpg)



使用原生方法、jQ、虚拟DOM和react分别对`ul`这一个DOM结构进行更新，可以发现：虚拟DOM和react好像并没有什么速度优势，这也许仅是一个简单示例，无法把虚拟DOM的高速表现的明显，那么再来创建一组更加复杂的结构。



![](http://tvax2.sinaimg.cn/large/ac62c933gy1gd2rro3zfnj20u009qwj0.jpg)

通过使用原生操作、Virtual DOM和React这3种方法，分别插入10000节点100次 和 修改3000节点属性100次，数据纬度：最快、平均和最慢。这个结果好像更加明显了，使用虚拟DOM好像真的并不怎么快。

> 思考：
>
> 在使用原生的方法进行操作的时候，我们的操作量级是非常小且已知的，但是当操作再上升几个量级，我们再使用原生方法进行操作时，还会有这么简单吗？也许速度还是很快，但是我们可能会因为操作繁琐变得头疼。

所以，如果要给为什么使用虚拟DOM这个问题一个答案：

**在频繁的操作中，使用虚拟DOM的可维护性更高，更加利于管理**，虽然它牺牲了部分性能，但我们不需要花那么多的心思去考虑A节点要更新什么属性，B节点要被创建，C节点要被挪到另外一层等等；一次编写，跨平台输出，编写React Native的代码学习成本也更低了。



# diff 算法

> React 称这一过程为：协调

上面我们讲过，React是通过虚拟DOM对象对真实DOM进行维护管理的。

具体是通过React 的 `render()` 方法，创建一棵由 React 元素组成的树。在下一次 state 或 props 更新时，相同的 `render()` 方法会返回一棵不同的树。React需要对比这2组树的差别，使用**diff算法**进行判别，进行高性能的渲染，

其实diff算法并不是React的原创(Virtual DOM也不是)，但是传统的diff算法：生成将一棵树转换成另一棵树的最小操作数的复杂度是 **O(n^3 )**，这意味着展示 1000 个元素所需要执行的计算量将在十亿的量级范围，这对于一些复杂的项目来说，代价实在是太大了。

React 针对这个情况，在diff算法中加入了自己的一些原则，将这个复杂度降到了**O(n)**，Amazing！

## 不同节点类型的比较

> 在更新视图时，一般的对应操作有：
>
> - `replaceChild()`  替换
> - `appendChild()/removeChild()` 插入/移除
> - `setAttribute()/removeAttribute()` 设置属性/ 移除属性
> - `textContent` 文本节点替换

### 节点类型不同

如果在DOM树的同一位置，前后输出不同类型节点，React会移除之前的节点，插入新的节点。即使之后的子节点是完全相同的，也不会再深层次的进行比较了，这样可以有效的降低算法的复杂度。

组件树也是如此。

```javascript
before render： <div />
    
after render: <span />
    
    => [removeNode <div />], [insertNode <span />]
```



### 节点类型相同，属性不同

React如果发现前后节点类型相同，属性不同，则会进行update操作，对之前的节点进行更新。

```javascript
before render： <div className=”indexWrap“ />
    
after render: <div className="pageWrap" />
    
    => [replaceAttribute id "pageWrap"]
```

## 逐层进行节点比较

在DOM树结构中，假设之后的节点发生变化，React只会对同一层次的节点进行对比。

![](http://tva4.sinaimg.cn/large/ac62c933gy1gd3ifwyj91j20kg0bdaae.jpg)

在对比时，根节点只会和根节点进行对比，子节点只会和同层次（位置）的子节点进行对比，它不会跨越节点位置比较。

- 如果子节点是新增的：React会直接创建并插入该节点

- 如果子节点被删除：React会直接移除并销毁该节点

- 如果子节点发生变化：React会对该节点进行更新

这样只需要对树进行一次遍历，便能完成整个 DOM 树的比较。 

### 列表节点的比较

假设在一个列表的渲染中，先后发生变化，React也会有一套自己的diff对比，当然React也是会执行同层比较的原则。

假设某个子节点的下一个分支分别渲染了 A-B-C-D-E 五个节点，那么当我们在其中某个位置插入一个F节点，React会怎么做呢？

```javascript
A - B - C - D - E
	  ↑ 插入F
```

这个时候React会先对查看其是否带有 **唯一标示**，也就是我们在React渲染某个数组节点时要带的`key`。

- 如果没有`key`，React无法高效的进行更新渲染，其开销会比较大。

  ```javascript
  A - B - C - D - E
  	  ↑ 插入F
        
  =>
  
  A - B
      - C销毁 & 更新为F - D销毁 & 更新为C - E销毁 & 更新为D - 插入E
  ```

- 如果子节点带有唯一标示`key`，React 使用 key 来匹配原有树上的子元素以及最新树上的子元素。

  ```javascript
  		A - B - C - D - E
  节点位置：1 - 2 - 3 - 4 - 5
  唯一标示：0 - 1 - 2 - 3 - 4
  	          ↑ 插入F
        
  =>
  		A - B - F        - C        - D        - E
  节点位置：1 - 2 - 3        - 4        - 5        - 6
  唯一标示：0 - 1 - 7（插入） - 2（移动） - 3（移动） - 4（移动）
  ```

  通过节点`key`值对比，React发现只有F是新增节点，唯一标示2、3、4的节点仅仅是向后移动了位置，并不会对它们进行销毁的操作，这在节点比较多的情况下可以节省很多渲染开销。

所以如果你在渲染一个数组列表时如果没有显性的添加key值，React会发出一个warn提示:

![](http://tva2.sinaimg.cn/large/ac62c933gy1gd3jj652a6j20ei01d3yi.jpg)

其实React也会默认添加一个数组下标为key值，但这不一定能够有效。当基于下标的组件进行重新排序时，组件 state 可能会遇到一些问题。由于组件实例是基于它们的 key 来决定是否更新以及复用，如果 key 是一个下标，那么修改顺序时会修改当前的 key，导致非受控组件的 state（比如输入框）可能相互篡改导致无法预期的变动。

所以我们应该主动的给列表子节点添加一个类似id这种不会重复的`key`值，帮助React高效执行diff算法。



## 小结

基于以上对比原则，React将diff算法的复杂度降到了O(n)。

另外有必要再说一点，React的diff算法是基于**WEB界面的特点** 制定以上原则的：

1. 两个相同组件产生类似的 DOM 结构，不同的组件产生不同的 DOM 结构；
2. 对于同一层次的一组子节点，它们可以通过唯一的 `key` 进行区分。

所以React建议我们：

1. 该算法不会尝试匹配不同组件类型的子树。如果你发现你在两种不同类型的组件中切换，但输出非常相似的内容，建议把它们改成同一类型。
2. `key` 应该具有稳定，可预测，以及列表内唯一的特质。不稳定的 key（比如通过 `Math.random()` 生成的）会导致许多组件实例和 DOM 节点被不必要地重新创建，这可能导致性能下降和子组件中的状态丢失。



这么久以来React并没有因为它的diff算法对比出过什么大的错误，不得不说，根据具体事物的具体特征因地制宜的执行某种策略，其成功的几率会非常高。





图片来源：

https://www.infoq.cn/article/react-dom-diff/

https://www.w3cplus.com/javascript/understand-the-Virtual-DOM.html




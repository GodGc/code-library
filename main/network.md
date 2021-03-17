# 网络协议

## UDP

UDP是一种面向报文的协议，它不会对报文进行任何处理，只负责搬运。
特点：

- 不可靠性

    UDP是无连接的，也就是说通信不需要建立和断开连接
    UDP是不可靠的，协议收到什么数据就传输什么数据，不备份也不会关心接收方能否收到
    UDP没有拥塞控制，一直会以恒定的速度发送数据。可能会造成丢包，但是如果在某些实时性要求高的场景（电话会议）就需要使用UDP而不是TCP

- 高效

    简单性决定了它的开销较小；UDP协议头只有8字节。

- 多种传输方式

    UDP提供了单播，多播，广播的功能

## TCP

TCP是HTTP下层的协议，它是无连接的，虽然TCP看似连接了客户端和服务端，但是其实只是两端共同维护了一个状态。
TCP协议中，主动发起请求的为客户端，被动连接的是服务端，它们都可以发送和接收数据，所以TCP是一个全双工的协议。

### TCP的三次握手和四次挥手

TCP协议会在连接时进行三次握手，断开连接时进行四次挥手；其目的是为了保证数据的完整性，避免丢包。

![](https://tva1.sinaimg.cn/large/00831rSTgy1gcs84o8cjnj31100no7a4.jpg)

建立三次握手：

- 第一次握手："你在吗?"
    客户端尝试连接服务器，向服务器发送syn包（同步序列编号*Synchronize Sequence Numbers*），syn=j，客户端进入SYN_SEND状态等待服务器确认

- 第二次握手："我在,请讲"
    服务器接收客户端syn包并确认（ack=j+1），同时向客户端发送一个SYN包（syn=k），即SYN+ACK包，此时服务器进入SYN_RECV状态

- 第三次握手： "好的,巴拉巴拉巴拉"
    客户端收到服务器的SYN+ACK包，向服务器发送确认包ACK(ack=k+1），此包发送完毕，客户端和服务器进入ESTABLISHED状态，完成三次握手

断开连接的四次挥手

- 客户端："我要关闭连接啦"
   TCP客户端发送一个FIN标识符，用来关闭客户到服务器的数据传送。
- 服务端："好的,我了解了"
   服务器收到这个FIN标识符，它发回一个ACK标识符，确认序号为收到的序号加1。和SYN标识符一样，一个FIN标识符将占用一个序号。
- 服务端："那我也关闭连接啦"
    服务器关闭客户端的连接，发送一个FIN标识符给客户端。
- 客户端："好的.我也了解了"
    客户端发回ACK标识符确认，并将确认序号设置为收到序号加1。

## UDP&TCP的区别

- UDP协议是**不可靠**的，它通信不需要建立和断开连接；TCP是**可靠**的，它通信需要建立和断开连接（三次握手和四次挥手确保传输的可靠性）
- UDP的开销较小，因为它不需要考虑接收方是否正确完整的接收到了数据（传输协议头部8字节）；TCP的开销较大，因为每次通信都需要进行三次握手和四次挥手（传输协议头部至少20字节）
- UDP传输无阻塞；TCP传输会有阻塞，所以它有拥塞处理机制

## HTTP

HTTP协议是无状态协议，不会保存状态。第一次连接和第N次连接都是一样崭新的。

> 先简单介绍下2个概念
> **副作用**指对服务器上的资源做改变，搜索是无副作用的，注册是副作用的。
> **幂等**指发送 M 和 N 次请求（两者不相同且都大于 1），服务器上资源的状态一致，比如注册 10 个和 11 个帐号是不幂等的，对文章进行更改 10 次和 11 次是幂等的。

### POST请求和GET请求的区别

- 在规范的应用场景上说，Get 多用于无副作用，幂等的场景，例如搜索关键字。Post 多用于副作用，不幂等的场景，例如注册。
- 在技术上说：
  - Get 请求能缓存，Post 不能
  - Post 相对 Get 安全一点点，因为Get 请求都包含在 URL 里，且会被浏览器保存历史纪录，Post 不会，但是在抓包的情况下都是一样的。
  - Post 可以通过 request body来传输比 Get 更多的数据，Get 没有这个技术
    URL有长度限制，会影响 Get 请求，但是这个长度限制是浏览器规定的，不是 RFC 规定的；Post 支持更多的编码类型且不对数据类型限制

### 常见状态码

**2XX 成功**

- 200 OK，表示从客户端发来的请求在服务器端被正确处理
- 204 No content，表示请求成功，但响应报文不含实体的主体部分
- 205 Reset Content，表示请求成功，但响应报文不含实体的主体部分，但是与 204 响应不同在于要求请求方重置内容
- 206 Partial Content，进行范围请求
  
**3XX 重定向**

- 301 moved permanently，永久性重定向，表示资源已被分配了新的 URL
- 302 found，临时性重定向，表示资源临时被分配了新的 URL
- 303 see other，表示资源存在着另一个 URL，应使用 GET 方法获取资源
- 304 not modified，表示服务器允许访问资源，但因发生请求未满足条件的情况
- 307 temporary redirect，临时重定向，和302含义类似，但是期望客户端保持请求方法不变向新的地址发出请求

**4XX 客户端错误**

- 400 bad request，请求报文存在语法错误
- 401 unauthorized，表示发送的请求需要有通过 HTTP 认证的认证信息
- 403 forbidden，表示对请求资源的访问被服务器拒绝
- 404 not found，表示在服务器上没有找到请求的资源

**5XX 服务器错误**

- 500 internal sever error，表示服务器端在执行请求时发生了错误
- 501 Not Implemented，表示服务器不支持当前请求所需要的某个功能
- 503 service unavailable，表明服务器暂时处于超负载或正在停机维护，无法处理请求

## HTTPS

HTTPS协议 实际上还是通过HTTP来传输信息的，但是信息通过TLS协议进行了加密

### TLS协议

它使用了2种加密技术：对称加密和非对称加密

**对称加密：**
对称加密就是两边拥有相同的秘钥，两边都知道如何将密文 加密解密。

**非对称加密：**
有公钥、私钥之分，公钥所有人都可以知道，可以将数据用公钥加密，但是解密必需使用私钥，私钥只有分发公钥的一方才知道。

**TLS握手过程：**

1. 客户端发送一个随机值+需要的协议+加密方式
2. 服务端收到客户端的随机值，自己也产生一个随机值，并根据客户端要求的协议+加密方式来发送自己的证书（也可以需求验证客户端证书）
3. 客户端收到服务端的证书并验证是否有效，验证通过后再生成一个随机值，通过服务端证书的公钥加密这个随机值并发送给服务端（如果被要求验证证书了会附带证书）
4. 服务端收到加密过的随机值并使用私钥解密获得这第三个随机值，这是两端都拥有了3个随机值。可以通过这三个随机值按照之前约定的加密方式生成秘钥，接下来的通信就可以通过该秘钥来加密解密

> TLS握手阶段，两端使用非对称加密来通信，但因为非对称加密损耗性能较大，所以正式传输数据时，两端使用对称加密方式通信。

### HTTPS 2.0和1.x的区别

- 相对于1.x中的文本传输，2.0采用二进制传输，所有传输的数据都会被分割，并采用**二进制格式编码**；
- HTTPS 2.0 相对于 1.x ，**提升了很多web性能**；**多路复用策略**避免了队头阻塞导致资源加载过慢；
- 2.0对**Header 进行了压缩**，使用了 HPACK 压缩格式对传输的 header 进行编码，减少了 header 的大小（场景比如传输cookie），并且两端维护了索引表，在继续的请求中可以使用缓存下来的Header；
- 2.0 可以**服务端 Push**

## DNS

DNS 的作用就是通过域名查询到具体的 IP。
因为 IP 存在数字和英文的组合（IPv6），很不利于人类记忆，所以就出现了域名。你可以把域名看成是某个 IP 的别名，DNS 就是去查询这个别名的真正名称是什么。
在 TCP 握手之前就已经进行了 DNS 查询，这个查询是操作系统自己做的。当你在浏览器中想访问 www.google.com 时，会进行一下操作：

1. 操作系统会首先在本地缓存中查询
2. 没有的话会去系统配置的 DNS 服务器中查询如果这时候还没得话，会直接去 DNS 根服务器查询，这一步查询会找出负责 com 这个一级域名的服务器
3. 然后去该服务器查询 google 这个二级域名
4. 接下来三级域名的查询其实是我们配置的，你可以给 www 这个域名配置一个 IP，然后还可以给别的三级域名配置一个 IP

以上介绍的是 DNS 迭代查询，还有种是递归查询，区别就是前者是由客户端去做请求，后者是由系统配置的 DNS 服务器做请求，得到结果后将数据返回给客户端。

PS：DNS 是基于 UDP 做的查询。

## WebSocket

相当于HTTP协议的补丁，为了弥补HTTP这种非持久协议。
HTTP 1.1 相对于HTTP 1.0，多了一个Connection请求头字段的值：keep-alive，在一个HTTP连接中，可以发送多个Request，接收多个Response。

WebSocket是一种双向通信协议。在建立连接后，WebSocket服务器端和客户端都能主动向对方发送或接收数据，就像Socket一样；WebSocket需要像TCP一样，先建立连接，连接成功后才能相互通信。

### 前端代码

```javascript
function socketConnect(url) {
    // 客户端与服务器进行连接
    let ws = new WebSocket(url); // 返回`WebSocket`对象，赋值给变量ws
    // 连接成功回调
    ws.onopen = e => {
        console.log('连接成功', e)
        ws.send('我发送消息给服务端'); // 客户端与服务器端通信
    }
    // 监听服务器端返回的信息
    ws.onmessage = e => {
        console.log('服务器端返回：', e.data)
        // do something
    }
    return ws; // 返回websocket对象
}
let wsValue = socketConnect('ws://121.40.165.18:8800');

// 如果需要发消息给服务端 
wsValue.send('new hello')

// 关闭ws
wsValue.closeMyself(); 
```

**传统的HTTP通信**
![](https://tva1.sinaimg.cn/large/00831rSTgy1gcs8534mr1j30jq0iytdx.jpg)

**WebSocket通信**
![](https://tva1.sinaimg.cn/large/00831rSTgy1gcs85ykqgoj30iw0fgadt.jpg)

**Websocket握手 示例**
**客户端：请求头升级**

```
GET /chat HTTP/1.1 
Host: server.example.com 
Upgrade: websocket 
Connection: Upgrade 
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw== 
Sec-WebSocket-Protocol: chat, superchat Sec-WebSocket-Version: 13 
Origin: http://example.com
```

重点请求首部意义如下：
Connection: Upgrade：表示要升级协议
Upgrade: websocket：表示要升级到websocket协议。
Sec-WebSocket-Version: 13：表示websocket的版本。如果服务端不支持该版本，需要返回一个Sec-WebSocket-Versionheader，里面包含服务端支持的版本号。
Sec-WebSocket-Key：与后面服务端响应首部的Sec-WebSocket-Accept是配套的，提供基本的防护，比如恶意的连接，或者无意的连接。

**服务端：相应协议升级**

```
// 状态代码101表示协议切换
HTTP/1.1 101 Switching Protocols 
Connection:Upgrade 
Upgrade: websocket 
Sec-WebSocket-Accept: Oy4NRAQ13jhfONC7bP8dTKb4PTU=

```

**实质：**
long poll  && ajax轮询

**特点：**
服务端可以主动推送信息给客户端

## "一个URL从输入到页面显示都经历了什么"

> 三端：客户端、中间端（连接过程）、服务端

1. 在浏览器输入一个URL，浏览器主进程中的UI线程会判断用户输入的是一个URL还是一个查询字符，如果是一个URL，那么network现成就会执行DNS查询
2. DNS查询：
   浏览器缓存=>系统缓存=>host文件=>代理缓存=>DNS系统调用查询DNS服务器=>最终得到对应的IP地址
3. 浏览器通过本地的一个随机端口对这个IP的80端口（或其他）进行访问，传递请求报文：请求头 & 请求体
4. 建立TCP/IP连接：三次握手
5. 服务器传递响应信息给浏览器
6. network 线程接收到服务器的响应内容，转接给renderer线程
   - 构建DOM
   - 次级的资源下载和加载：当浏览器遇到 <img> <link> 等标签，network thread会去下载这些内容JS 的下载与执行
   - 当遇到`script`标签时，渲染进程会停止解析HTML,而去加载、解析和执行js代码，停止解析的原因是js代码可能会改变DOM结构
   - 样式计算
   - 获取布局
   - 绘制各元素
   - 合成帧
   - ...
7. 绘制完成后，关闭TCP连接，期间会有四次挥手

## 浏览器

### 同源策略和跨域请求

详细见：[http://www.godrry.com/archives/Same-origin-policy-and-CORS.html](http://www.godrry.com/archives/Same-origin-policy-and-CORS.html)

jsonp的使用代码：兼容性不错，但是只适用于**get**方法

```HTML
<script src="http://domain/api?param1=a&param2=b&callback=jsonp"></script>
<script>
    function jsonp(data) {
        console.log(data)
    }
</script>
```

### 数据储存

**cookie，localStorage，sessionStorage，indexDB**
![](https://tva1.sinaimg.cn/large/00831rSTgy1gcs86c2tsyj315o0emtcs.jpg)

### 重绘、回流

重绘和回流是渲染步骤中的一小节，但是这两个步骤对于性能影响很大。

- 重绘是当节点需要更改外观而不会影响布局的，比如改变 color 就叫称为重绘
- 回流是布局或者几何属性需要改变就称为回流。

回流注定发生重绘，但是重绘不一定发生回流。回流的开销更大。

以下操作会影响性能：

- 改变 window 大小
- 改变字体
- 添加或删除样式
- 文字改变
- 定位或者浮动
- 盒模型

**减少重绘和回流：**

- 使用 translate 替代 top
- 使用 visibility 替换 display: none ，因为前者只会引起重绘，后者会引发回流（改变了布局）
- 把 DOM 离线后修改，比如：先把 DOM 给 display:none (有一次 Reflow)，然后你修改 100 次，然后再把它显示出来

### document.ready（jq中的）和window.onload的区别

页面加载完毕有2种情况：

- ready表示文档结构加载完毕（不包含图片等资源）
- onload表示页面包括图片等资源全部加载完毕

ready事件在DOM结构绘制完成之后就会执行，这样能确保就算有大量的媒体文件没加载出来，JS代码一样可以执行。

load事件必须等到网页中所有内容全部加载完毕之后才被执行。如果一个网页中有大量的图片的话，则就会出现这种情况：网页文档已经呈现出来，但由于网页数据还没有完全加载完毕，导致load事件不能够即时被触发。

**ready事件先于onload事件执行**

### 如何渲染几万条数据并不卡住界面

这道题考察了如何在不卡住页面的情况下渲染数据，也就是说不能一次性将几万条都渲染出来，而应该一次渲染部分 DOM，那么就可以通过 `requestAnimationFrame` 来每 16 ms 刷新一次。

```html

<!DOCTYPE html><html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body>
    <ul>
      控件
    </ul>
    <script>
      setTimeout(() => {
        // 插入十万条数据
        const total = 100000
        // 一次插入 20 条，如果觉得性能不好就减少
        const once = 20
        // 渲染数据总共需要几次
        const loopCount = total / once
        let countOfRender = 0
        let ul = document.querySelector('ul')
        function add() {
          // 优化性能，插入不会造成回流
          const fragment = document.createDocumentFragment()
          for (let i = 0; i < once; i++) {
            const li = document.createElement('li')
            li.innerText = Math.floor(Math.random() * total)
            fragment.appendChild(li)
          }
          ul.appendChild(fragment)
          countOfRender += 1
          loop()
        }
        function loop() {
          if (countOfRender < loopCount) {
            window.requestAnimationFrame(add)
          }
        }
        loop()
      }, 0)
    </script>
  </body></html>
```

## 安全

### XSS攻击

  html代码中嵌入了script脚本内容，`<div><script>alert(1)</script></div>`, 或者在url参数上拼接了script代码
  如何防范：对敏感字符进行转义

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
 
### CSRF
简单点说，CSRF 就是利用用户的登录态发起恶意请求。
如何防御防范 
CSRF 可以遵循以下几种规则：
  - Get 请求不对数据进行修改
  - 不让第三方网站访问到用户 Cookie（SameSite属性）
  - 阻止第三方网站请求接口（验证 Referer）
  - 请求时附带验证信息，比如验证码或者 token

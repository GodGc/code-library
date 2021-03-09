# webpack

1. loader 和 plugin 区别，举几个常用并说出作用

  - `loader`，它是一个转换器，将A文件进行编译成B文件，比如：将A.less转换为A.css，单纯的文件转换过程。

  - `plugin`是一个扩展器，它丰富了webpack本身，针对是loader结束后，webpack打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听webpack打包过程中的某些节点，执行广泛的任务


2. webpack 提取多页面（项目）都引用的库 vendor

3. webpack 分模块打包、多入口打包/多页面打包？

  使用 `optimization` 代码分割

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

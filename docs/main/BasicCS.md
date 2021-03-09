# 【计算机科学速成课】 
Crash Course Computer Science

> B站观看地址： https://www.bilibili.com/video/av21376839
> 第一集未记录（无核心知识点）

## electronic-computer

- 用于计算，优势：效率高于人，计算范围也更大，程序正确可保证结果正确
- 优化：继电器 => 真空管 => 晶体管计算机（体积更小，成本更低，原料：硅）
- 原理：晶体管是一个开关，可以用"控制线路"来控制它开或者关，晶体管有2个电极，电极之间有一种材料间隔，这种材料有时候导电，有时候不导电；就是这样来控制开或者关（半导体原理）；"控制线路"链接到一个"gate"门电极，通过改变门电极的电荷，控制半导体的导电性。


## boolean-gate and boolean-gate
> 物理层实现原理
- 电路闭合，电流流过，代表“真” => 1
- 电路断开，无电流流过，代表“假” => 0
- 早期计算机有三进制，五进制，但是越多的状态越难定位信息
- 逻辑操作：NOT AND OR
  - 通过电流操作，将一个true转变为false，反之亦然
  - AND 的实现是通过2个晶体管连在一个 如果2个都有电流通过（TRUE），那么输出也会是TRUE
  - 实现OR不仅需要2个晶体管，还需要额外的线，使用并联，只要一个有电流通过（TRUE），那么输出也是TRUE
  

## Representing Numbers
- base on two number 0/1
- 如果超过1，则carry（进位）1
  - 例如 表示3，二进制为：11
- 二进制中，一个1或0，叫一位（bit），8位 == 1字节（bytes）
- 32、64位计算机意思是一块块处理数据，每块是32或者64位（bit）
- 计算机必须给内存中的每一个位置，做一个“标记”，这个标记叫做“位址”，目的是为了方便存取数据
- 为了方便计算机编码（表示除数字以外的内容），先后出现了ASCII（for English） 和 UNICODE（for all） 码


## How computers calculate？ ALU（算术逻辑单元）
ALU有2个单元，一个算术单元和一个逻辑单元
#### 算法单元：
- half adder || full adder  => 半加器 || 全加器
  > 目前计算机的加法电路是：“超前进位加法器”（carry-look-ahead adder）
- 加法和减法的电路比较简单，但是乘法电路更加复杂，不过只不过就是用了更多了逻辑门来处理，所以一般处理器都比较贵

#### 逻辑单元：
- 执行逻辑操作，比如AND OR NOT 等
- 溢出标志等



## 寄存器 & 内存 - Registers & RAM

- RAW：随机存取存储器，只能在有电的情况下进行存取
- 持久存储：电源关闭时数据也不会丢失

#### 寄存器
![8位寄存器](https://tva1.sinaimg.cn/large/006tNbRwgy1gamubuvp63j30r50gd7po.jpg)

寄存器由 锁存器 构成，用于存取

同时使用矩阵(MATRIX) 排列锁存器，节省线路，所以对于256位的存储，只需要35条线，1条“数据线”，1条“允许写入先“，1条”允许读取线“，还有16行16列的线用于选择锁存器（16+16+3=35）

#### 内存：Random-Access Memory
内存的一个重要特性：可以随时访问任何位置，因为此叫随机存取存储器（RAW）
物理内存条上每一区域包含4（n）个小块，上面都是一些矩阵，
![内存条](https://tva1.sinaimg.cn/large/006tNbRwgy1gamy7a9tukj30sb0foe6o.jpg)

划重点：**矩阵** 为内存底层结构，方便每个门的排列组合，效率最大化


## CPU：The central processing unit

#### CPU构成和工作流程

![CPU](https://tva1.sinaimg.cn/large/006tNbRwgy1gamyih5uf7j30r40g9ke3.jpg)

- 取指令阶段：指令地址寄存器 去 RAW 中寻找指令地址
- 解码阶段：指令取出后由”控制单元“进行解码
- 执行阶段： 根据解码后的指令去RAW和寄存器通信，执行读写动作，最后”指令地址寄存器“+1，执行阶段结束

一次CPU执行速度被一个clock控制，这个速度所以被称为”时钟时间“，这个周期也被叫做”时钟周期。
目前电脑和手机，差不多有几千兆赫兹每秒。

> 小知识插入：计算机的”超频“，就是修改时钟速度，加快CPU的速度；CPU制造商通常会给CPU留一点余地，可以接受一点超频，但超频过多会产生过热，导致乱码。（降频同理，节省功效）


## 指令和程序 Instructions & Programs

> CPU 之所以强大，是因为它是可编程的，CPU是一块硬件，可以被软件控制（汇编语言）

本节没特殊需要记录的点，只要都是一些CPU运行指令的过程，CPU通过内存中的地址执行指令，执行对应的程序，相关指令比如：`JUMP、ADD、SUB、MOP`等 

![指令](https://tva1.sinaimg.cn/large/006tNbRwgy1gan109fnr9j30rz0gbka5.jpg)

现代CPU有上千个指令和指令变种。指令越多，CPU功能则会更多


## 高级CPU设计 - Advanced CPU Design

早起计算机CPU指令并不包含除法，现代CPU直接在硬件层面设计了除法，可以直接给ALU除法指令。

指令越来越多，那么如何能够快速的传输给CPU呢？

![RAM](https://tva1.sinaimg.cn/large/006tNbRwgy1gan1b0a5zzj30jw0fgdse.jpg)

RAM则是瓶颈，因为RAM和CPU之间的通信是需要信号传输的，RAM的寻址、读取也是要花时间，所以可能会出现延迟的情况。
  
- 为了解决延迟，给CPU加一点RAM - ”缓存“：cache，RAM传输一批数据给CPU储存在cache中。CPU就不需要空等数据。

  如果想要的数据在缓存中，那么叫 ”缓存命中“ - cache hit
  如果不在，则叫”混村未命中“ - cache miss
  
  - Dirty Bit：脏位

    同步一般发生在：当缓存满了而CPU又要缓存时，在清理缓存腾出空间之前，会先检测”脏位“，如果是”脏“的，在加载新内容之前，会把数据写回RAM，

- 另外一种提升性能的方法：”指令流水线“

  ”并行处理“可以进一步提高效率，CPU”执行“一个指令时，同时”解码“下一个指令， ”读取“下下个指令，

  ![单线处理](https://tva1.sinaimg.cn/large/006tNbRwgy1gantt472avj30qj0cjwup.jpg)
  **变为**
  ![并行处理](https://tva1.sinaimg.cn/large/006tNbRwgy1gants0w8cvj30mc0fi4fe.jpg)

  但是如果数据之间有依赖关系，那么流水线处理器需要弄清数据依赖性，必要时停止流水线，避免出现问题。
  - ”乱序执行“（OUT-OF-ORDER EXECUTION）：高性能CPU可以**动态排序**有依赖关系的指令，最小化停工时间。

  - ”推测执行“（Speculative execution）：如果指令是`JUMP`类的，高端CPU会猜测下个指令会在何处（"分支预测"），然后提前把指令放进流水线；如果猜测结果不对，CPU则需要清空流水线。

- 同时运行多个指令流，提升性能。

  ![多核处理器](https://tva1.sinaimg.cn/large/006tNbRwgy1ganu4lmmqxj30iv0eq18t.jpg)

  ![多核处理器](https://tva1.sinaimg.cn/large/006tNbRwgy1ganu60gzrtj30s40ffx4n.jpg)

  多核之间可以共享缓存、数据等。
  
- 有时甚至可以给计算机多加几个多核CPU



## 早期汇编方式和汇编语言发展史

- 早期汇编方式： 通过punch card 打卡，早期计算机通过打卡情况判定指令进行运算

- 汇编语言发展史

  汇编语言是讲人们输入的内容转换为计算机能够识别的指令，就想”hello“转变成莫斯摩尔斯代码为”.... . .-.. .-.. ---“,这是2种不同语言的转化。

  汇编语言的出现可以让程序员可以专心变成，不用关心底层细节，隐藏不必要的细节来做更复杂的工作。

  ![汇编语言的转化](https://tva1.sinaimg.cn/large/0082zybply1gbnygo3dsdj31dn0u0npf.jpg)

  早期，Grace Hopper 设计了 compiler: "A-0"，但是当时并没有被广泛使用，但它启发了众多的人。现在comliper已经有上百种之多，比如Python，JavaScript。

  编程语言可以让程序员只需要创建 代表内存地址的抽象，叫”变量“。 ”out of sight, out of mind“，程序员不需要关心究竟是怎么去分配内存地址，更加的简单。

  - FORTRAN（formula translation）,这门语言由IBM发布在1957年，主宰了当时的编程市场。这门语言经过它的编译器处理后能够转化为计算机能够识别的代码，这比手工编写快了20倍。

  - 1959年组建了”数据系统语言委员会“，开发一种通用编程语言，可以被支持在不同的计算机上运行，最后诞生了”COBOL“这门高级语言，每个计算机架构需要有一个COBOL编译器来支持，实现了”Write Once，Run anywhere“。

  - 1960: ALGOL, LISP, BASIC诞生

  - 1970: Pascal, C, SmallTalk

  - 1980: C++, Objective-C, Perl

  - 1990: Python, Ruby, Java

  - 2000: Swift, C#, Go


> 第11节及之后就讲了很多现代程序员都了解的一些东西了，就不再做记载了，有兴趣的话可以继续去B站观看，其中第16节讲了一个很不错的概念，note一下

## Software engineering

#### **面向对象编程**的核心是：**隐藏复杂度，选择性的公布功能**，因为做大型项目很有效，所以广受欢迎。
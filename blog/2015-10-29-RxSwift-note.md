# RxSwift 笔记
> 2015-10-29 15:08:27

---

#  序
作为一个 ReactiveCocoa 的脑残粉,看到 RAC 在 Swift 下惨不忍睹的状况, 我毅然决然的决定.....去寻找备胎,然后找到大名鼎鼎的ReactiveX团队出的 RxSwift, 然后看到他们完美的 Playground 教程然后我就决定入坑了.



#  Observables

Observables 是 RxSwift 里面最常用的一个类,但是这么名字有点逗啊,翻译上面是这么写的

> adj. 观察得到的; 应遵守的; 应庆祝的

什么鬼,为什么不是名词,这样子我很难翻译啊,作为一个 RAC 的脑残粉,我觉得强行把它叫做Signal信号,然后先忽略他的内部实现,在造轮子之前先学会用轮子.

在`Observable+Creation.swift` 文件里面有他各种各样创建Observables的方法


## 信号种类

在 RAC 里面信号分三种 (complete , error ,next),在 RxSwift 里面也是一样,他是通过枚举实现的

```swift
public enum Event<Element> : CustomStringConvertible {
    /**
    Next element is produced
    */
    case Next(Element)

    /**
    Sequence terminates with error
    */
    case Error(ErrorType)

    /**
    Sequence completes sucessfully
    */
    case Completed

    /**
    - returns: Description of event
    */
    public var description: String {
        get {
            switch self {
            case .Next(let value):
                return "Next(\(value))"
            case .Error(let error):
                return "Error(\(error))"
            case .Completed:
                return "Completed"
            }
        }
    }
}

```

## empty
一个空序列只发送 `完成信号 `

**RxSwift栗子:**

```swift
example("empty") {
    let emptySequence: Observable<Int> = empty()

    let subscription = emptySequence
        .subscribe { event in
            print(event)
        }
}
```

**RAC栗子:**

```swift
 RACSignal *empty = [RACSignal empty];
 [empty subscribeCompleted:^{
	NSLog(@"Complete");
 }];
```



## never
啥都不干的信号, -,,-) 好吧.....
**RxSwift栗子:**

```swift
example("never") {
    let neverSequence: Observable<String> = never()

    let subscription = neverSequence
        .subscribe { _ in
            print("This block is never called.")
        }
}

```

**RAC栗子:**


```swift
RACSignal *never = [RACSignal never];
[never subscribeNext:^(id x) {
    NSLog(@"Next : %@", x);
} completed:^{
    NSLog(@"Complete");
}];
```

## just
返回一个包含 信息的 next 信号 和 一个完成信号
**RxSwift栗子:**


```swift
example("just") {
    let singleElementSequence = just(32)

    let subscription = singleElementSequence
        .subscribe { event in
            print(event)
        }
}
```

**RAC栗子:**

```swift
RACSignal *just = [RACSignal return:@"Just"];
[just subscribeNext:^(id x) {
    NSLog(@"Next : %@", x);
} completed:^{
    NSLog(@"Complete");
}];
```

## sequenceOf
直接创建一个序列
**RxSwift栗子:**


```swift
example("sequenceOf") {
    let sequenceOfElements/* : Observable<Int> */ = sequenceOf(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)

    let subscription = sequenceOfElements
        .subscribe { event in
            print(event)
        }
}

```

## from
从其他序列类型创建一个序列
**RxSwift栗子:**


```swift
example("from") {
    let sequenceFromArray = [1, 2, 3, 4, 5].asObservable()

    let subscription = sequenceFromArray
        .subscribe { event in
            print(event)
        }
    }


```

## failWith
失败信号
**RxSwift栗子:**


```swift
example("failWith") {
    let error = NSError(domain: "Test", code: -1, userInfo: nil)

    let erroredSequence: Observable<Int> = failWith(error)

    let subscription = erroredSequence
        .subscribe { event in
            print(event)
        }
}

```

**RAC栗子:**

```swift
NSError *error = [NSError errorWithDomain:@"Error" code:-1 userInfo:nil];
RACSignal *signal = [RACSignal error:error];
[signal subscribeError:^(NSError *error) {
    NSLog(@"Error : %@",error);
}];

```

## deferred
创建一个信号直到有人订阅他,并且每次重新创建该信号,但是在 RAC 中的说法就是可以用来有效地将热信号变成冷的信号。这里就有一些奇怪了,RAC 中createSignal中的 block 确实是等到有订阅者订阅才被触发.而且官方的例子似乎也不能说明这个问题.

> - Hot Observable是主动的，尽管你并没有订阅事件，但是它会时刻推送，就像鼠标移动；而Cold Observable是被动的，只有当你订阅的时候，它才会发布消息。
> - Hot Observable可以有多个订阅者，是一对多，集合可以与订阅者共享信息；而Cold Observable只能一对一，当有不同的订阅者，消息是重新完整发送。
> - 这里有一个很重要的概念，就是任何的信号转换即是对原有的信号进行订阅从而产生新的信号

>  - 来源: [细说ReactiveCocoa的冷信号与热信号](http://tech.meituan.com/talk-about-reactivecocoas-cold-signal-and-hot-signal-part-2.html) (by 美团技术团队)  

**RxSwift栗子:**


```swift
example("deferred") {
    let deferredSequence: Observable<Int> = deferred {
        print("creating")
        return create { observer in
            print("emmiting")
            observer.on(.Next(0))
            observer.on(.Next(1))
            observer.on(.Next(2))

            return NopDisposable.instance
        }
    }

    deferredSequence
        .subscribe { event in
            print(event)
    }

    deferredSequence
        .subscribe { event in
            print(event)
        }
}

```

---

# 错误处理

目前 RxSwift 中的错误是指错误信号 而不是通过 try-catch 而捕获到的异常

#### catchError
// 在捕获到错误信号后返回指定信号

```swift
example(false, name: "catchError"){
    let sequenceThatFails = PublishSubject<Int>()
    let recoverySequence = sequenceOf(100, 200, 300, 400)
    let _ = sequenceThatFails.catchError{_ in return recoverySequence}.subscribe {print("Common \($0)")}
    let _ = sequenceThatFails.catchErrorJustReturn(9999).subscribe{print("Just:\($0)")}
    sequenceThatFails.on(.Next(1))
    sequenceThatFails.on(.Next(2))
    sequenceThatFails.on(.Error(NSError(domain: "Test", code: 0, userInfo: nil)))
    /*
    ---- catchError star ----
    Common Next(1)
    Just:Next(1)
    Common Next(2)
    Just:Next(2)
    Common Next(100)
    Common Next(200)
    Common Next(300)
    Common Next(400)
    Common Completed
    Just:Next(9999)
    Just:Completed
    ---- catchError end ----
    */
}
```

#### retry

// 发生错误时重新订阅信号

// retry : 可以无限重试

// retry(maxAttemptCount: Int) : 可以指定重试次数

```swift
example(false, name: "retry"){
    var sendError = true
    let sourceSignal : Observable<Int> = create{ observer in
        print("Create Signal")
        observer.on(.Next(1))
        observer.on(.Next(2))
        if sendError{
            let error = NSError(domain: "Test", code: 0, userInfo: nil)
            observer.onError(error)
            sendError = false
        }else{
            observer.onComplete()
        }
        return NopDisposable.instance
    }
    let _ = sourceSignal.retry().subscribe{print($0)}
    /*
    ----retry star ----
    Create Signal
    Next(1)
    Next(2)
    Create Signal
    Next(1)
    Next(2)
    Completed
    ----retry end ----
    */
}
```

---

#  信号的运算与操作

RxSwift 中很多运算和操作与 Swift 中集合类型的高阶函数比较相似,下面我来同时使用两者来看看其中的异同


### 信号的变形

#### map
// 这些高阶函数就基本和 Swift 原生的功能和用法基本相似

```swift
example( false, name: "map"){
    print("RxSwift Version:")
    let originalSequence = sequenceOf(Character("A"), Character("B"), Character("C"))
    let _ = originalSequence.map{$0.hashValue}.subscribe{print($0)}

    print("Swift Version:")
    let swiftOriginalSequence = [Character("A"), Character("B"), Character("C")]
    let _ = swiftOriginalSequence.map{$0.hashValue}.forEach{print($0)}
    /*
    ----map star ----
    RxSwift Version:
    Next(4799450059485597671)
    Next(4799450059485597672)
    Next(4799450059485597677)
    Completed
    Swift Version:
    4799450059485597671
    4799450059485597672
    4799450059485597677
    ----map end ----
    */
}
```


#### flatMap
// 这里的 flatMap 好像就有一些差异

```swift
example(false, name: "flatMap"){
    print("RxSwift Version:")
    let array : [[Int]] = [[1,2,3],[4,5,6],[7,8,9]]
    let originalSequence = array.map{$0.asObservable()}.asObservable()
    let otherSequence = ["A","B","C","D","---"].asObservable()
    let _ = originalSequence.flatMap{ int in
            otherSequence
        }.subscribe{print($0)}

    print("Swift Version:")
    print(array.flatMap{$0.map{String($0)}})
    /*
    ----flatMap star ----
    RxSwift Version:
    Next(A)
    Next(B)
    Next(C)
    Next(D)
    Next(---)
    Next(A)
    Next(B)
    Next(C)
    Next(D)
    Next(---)
    Next(A)
    Next(B)
    Next(C)
    Next(D)
    Next(---)
    Completed
    Swift Version:
    ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    ----flatMap end ----
    */
}
```

#### scan / reduce
// sacn 会显示每次中间计算的结果
// reduce 只会显示最终的计算结果

```swift
example( false, name: "scan / reduce"){
    print("RxSwift Version:")
    let sequenceToSum = sequenceOf(0, 1, 2, 3, 4, 5, 6)
    let _ = sequenceToSum.scan(0){$0+$1}.subscribe{print($0)}

    let _ = sequenceToSum.reduce(0){$0+$1}.subscribe{print($0)}

    print("Swift Version:")
    let array = [1,2,3,4,5,6]
    print("Sum : \(array.reduce(0){$0+$1})");

    /*
    ----scan / reduce star ----
    RxSwift Version:
    Next(0)
    Next(1)
    Next(3)
    Next(6)
    Next(10)
    Next(15)
    Next(21)
    Completed
    Next(21)
    Completed
    Swift Version:
    Sum : 21
    ----scan / reduce end ----

    */
}
```


### 信号的筛选

#### filter
// 过滤

```swift
example(false, name: "filter"){
    let array = [1,2,3,4,5,6,7,8,9]

    print("RxSwift Version:")
    let _ = array.asObservable().filter{ $0%2 == 0}.subscribe{print($0)}

    print("Swift Version:")
    array.filter{$0%2 == 0}.forEach{print($0)}

    /*
    ----filter star ----
    RxSwift Version:
    Next(2)
    Next(4)
    Next(6)
    Next(8)
    Completed
    Swift Version:
    2
    4
    6
    8
    ----filter end ----
    */
}
```


#### distinctUntilChanged
// 和前一次的值比较,直到值发生改变才发出信号(这个改变的依据可以用闭包来进行自定义)

```swift
example(false, name: "distinctUntilChanged"){
    let array = [1,1,2,2,1,1,3,3,4,4]

    let _ = array.asObservable().distinctUntilChanged().subscribe{print($0)}
    /*
    ----distinctUntilChanged star ----
    Next(1)
    Next(2)
    Next(1)
    Next(3)
    Next(4)
    Completed
    ----distinctUntilChanged end ----
    */
}
```

#### take
// 这是一个系列的函数
// 获取几次信号,通常用法是个限定只用一次

```swift
example(false, name: "take"){
    let array = [1,2,3,4,5,6,7,8,9]
    let _ = array.asObservable().take(3).subscribe{print($0)}

    /*
    ----take star ----
    Next(1)
    Next(2)
    Next(3)
    Completed
    ----take end ----
    */
}
```

### 信号的组合

#### startWith
// 实质上实在原有Observables前面加上新的元素然后组成新的Observables,但是不改变原有Observables

```swift
example(false, name: "startWith"){
    let originalSequence = [1,2,3,].asObservable().startWith(123)
    let _ = originalSequence.startWith(12).startWith(11).startWith(10).subscribe{print($0)}
    let _ = originalSequence.subscribe{print($0)}

    /*
    ----startWith star ----
    Next(0)
    Next(0)
    Next(0)
    Next(1)
    Next(2)
    Next(3)
    Completed
    Next(1)
    Next(2)
    Next(3)
    Completed
    ----startWith end ----
    */
}
```

#### combineLatest
// 将两个Observables组合成一个Observables, 条件是Observables必须有一个.Next ,然后combineLatest 就会将两个Observables最后的.Next 信号合在一起

```swift
example(false, name: "combineLatest"){

    let pub1 = PublishSubject<Int>()
    let pub2 = PublishSubject<String>()

    let _ = combineLatest(pub1, pub2){ String($0) + "." + $1}.subscribe{print($0)}

    pub1.on(.Next(1))
    pub1.on(.Next(2))
    pub2.on(.Next("A"))
    pub2.on(.Next("B"))

    /*
    ----combineLatest star ----
    Next(2.A)
    Next(2.B)
    ----combineLatest end ----
    */

}
```


#### zip
// 按顺序一次组合,而不是像 combineLatest 选最后一个

```swift
example(false, name: "zip"){
    let pub1 = PublishSubject<Int>()
    let pub2 = PublishSubject<String>()

    let _ = zip(pub1, pub2){ String($0) + "." + $1}.subscribe{print($0)}

    pub1.on(.Next(1))
    pub1.on(.Next(2))
    pub1.on(.Next(3))
    pub2.on(.Next("A"))
    pub1.on(.Next(4))
    pub2.on(.Next("B"))
    pub2.on(.Next("C"))
    pub2.on(.Next("D"))
    pub2.on(.Next("E"))
    pub2.on(.Next("F"))


    /*
    ----zip star ----
    Next(1.A)
    Next(2.B)
    Next(3.C)
    Next(4.D)
    ----zip end ----
    */
}
```


#### merge
// 可以想象成两个水管合并,两个Observables之间不发生组合,而是在同一个Observables中传递
// 但是merge 不能将两个不同类 Observables 组合在一起(可以用 Any或 AnyObject 解决,但是不建议,可以对其中一个序列使用 map 从而使得两者类型相同)

```swift
example(false, name: "merge"){

    let pub1 = PublishSubject<Int>()
    let pub2 = PublishSubject<Int>()

    let _  =  sequenceOf(pub1, pub2).merge().subscribe{print($0)}

    pub1.on(.Next(1))
    pub1.on(.Next(2))
    pub1.on(.Next(3))
    pub2.on(.Next(100))
    pub1.on(.Next(4))
    pub2.on(.Next(200))
    pub2.on(.Next(300))
    pub2.on(.Next(400))

    /*
    ----merge star ----
    Next(1)
    Next(2)
    Next(3)
    Next(100)
    Next(4)
    Next(200)
    Next(300)
    Next(400)
    ----merge end ----
    */
}
```

#### contact
// 一个信号完成后才能开始另一个信号,将两个信号头尾相接
// 通常用在 网络请求后进行本地数据库写入

```swift
example(false, name: "contact"){
    let var1 = BehaviorSubject(value: 0)
    let var2 = BehaviorSubject(value: 200)

    // var3 is like an Observable<Observable<Int>>
    let var3 = BehaviorSubject(value: var1)

    let _ = var3.concat().subscribe{print($0)}

    var1.on(.Next(1))
    var1.on(.Next(2))
    var1.on(.Next(3))
    var1.on(.Next(4))

    var3.on(.Next(var2))

    var2.on(.Next(201))

    var1.on(.Next(5))
    var1.on(.Next(6))
    var1.on(.Next(7))
    var1.on(.Completed)

    var2.on(.Next(202))
    var2.on(.Next(203))
    var2.on(.Next(204))

    /*
    ----contact star ----
    Next(0)
    Next(1)
    Next(2)
    Next(3)
    Next(4)
    Next(5)
    Next(6)
    Next(7)
    Next(201)
    Next(202)
    Next(203)
    Next(204)
    ----contact end ----
    */

}

```


#### switchLatest
// 解决信号中的信号问题

```swift
example(false, name: "switchLatest"){
    let inner1 = Variable(1)

    //这个就是信号中的信号
    let container = Variable(inner1)


    print("Origin :")
    let _ = container.subscribe{print($0)}

    print("SwitchLatest :")
    let _ = container.switchLatest().subscribe{print($0)}

    /*
    ----switchLatest star ----
    Origin :
    Next(RxSwift.Variable<Swift.Int>)
    SwitchLatest :
    Next(1)
    ----switchLatest end ----
    */
}
```

#### doOn

// 相当于 RAC 里面的 doNext,doError,doComplete 的集合,可以在信号的传递链中的任意位置设置 hook 而不改变信号本身

```swift
example(false, name: "doOn"){
    let sourceSignal = PublishSubject<String>()
    let _ = sourceSignal.doOn(onNext: { (str) -> Void in
                    print("Next")
                }, onError: { (error) -> Void in
                    print("Error")
                }, onCompleted: { () -> Void in
                    print("Complete")
            }).subscribe{print($0)};
    sourceSignal.onNext("One")
    sourceSignal.onNext("Two")
    sourceSignal.onComplete()
}
```

#### takeUntil

// 直到收到某个信号前,能一直发送信号,当收到 takeUntil 的后立即发送 complete 信号
// 常用在 tableviewcell 中,当 cell 重用时避免信号重复

```swift
example(false, name: "takeUntil"){
    let originalSequence = PublishSubject<Int>()
    let whenThisSendsNextWorldStops = PublishSubject<Int>()
    let _ = originalSequence.takeUntil(whenThisSendsNextWorldStops).subscribe {print($0)}
    originalSequence.on(.Next(1))
    originalSequence.on(.Next(2))
    originalSequence.on(.Next(3))
    originalSequence.on(.Next(4))
    whenThisSendsNextWorldStops.on(.Next(1))
    originalSequence.on(.Next(5))
}
```

#### takeWhile

// 通过 takeWhile 中的返回值类型为 Bool 的闭包来判断什么时候结束信号

```swift
example(false, name: "takeWhile"){
    let sequence = PublishSubject<Int>()
    let _ = sequence.takeWhile { int in int < 4}.subscribe {print($0)}
    sequence.on(.Next(1))
    sequence.on(.Next(2))
    sequence.on(.Next(3))
    sequence.on(.Next(4))
    sequence.on(.Next(5))
}
```

---

# Subject

subject是一个可以手动控制的信号。
subject可以看作是信号的一个“可变”变体(variant)，就像NSMutableArray之于NSArray。它对于桥接非rx代码到信号中去非常有用。

####  Tools
全局便利函数

```swift
func example(active:Bool,name:String,action:()->()){
    if active{
        print("----\(name) star ----")
        action()
        print("----\(name) end ----");
    }
}


func writeSequenceToConsole<O: ObservableType>(name: String, sequence: O) {
   let _ = sequence.subscribe {print("Subscription: \(name), event: \($0)")}
}

```

#### PublishSubject
不断往外发出信号,不管有没有人订阅(相当于热信号),当前时间点订阅的订阅者不能收到之前的信号

```swift
example( false, name: "PublishSubject"){
   let subject = PublishSubject<String>()
   subject.onNext("A");
   writeSequenceToConsole("1", sequence: subject)
   subject.onNext("B");
   subject.onNext("C");
   writeSequenceToConsole("2", sequence: subject)
   subject.onNext("D");

   /*
   ----PublishSubject star ----
   Subscription: 1, event: Next(B)
   Subscription: 1, event: Next(C)
   Subscription: 1, event: Next(D)
   Subscription: 2, event: Next(D)
   ----PublishSubject end ----
   */
```



#### ReplaySubject
虽然也是不断往外发出信号,不管有没有人订阅(相当于热信号),但是订阅者无论什么时候订阅都能收到缓冲区里的所有信号,因为ReplaySubject会保存这些结果,并且重播,bufferSize表示它最大可缓存信号的个数

```swift
 example(false, name: "ReplaySubject"){
     let subject =  ReplaySubject<String>.create(bufferSize: 1)
     subject.onNext("A");
     writeSequenceToConsole("1", sequence: subject)
     subject.onNext("B");
     subject.onNext("C");
     writeSequenceToConsole("2", sequence: subject)
     subject.onNext("D");
     /*
     ----ReplaySubject star ----
     Subscription: 1, event: Next(A)
     Subscription: 1, event: Next(B)
     Subscription: 1, event: Next(C)
     Subscription: 2, event: Next(C)
     Subscription: 1, event: Next(D)
     Subscription: 2, event: Next(D)
     ----ReplaySubject end ----
     */
 }
```

#### BehaviorSubject
再有信号发出之前订阅会收到一个默认的信号,在有信号之后订阅就收不到了

```swift
example(false, name: "BehaviorSubject"){
    let subject =  BehaviorSubject(value: "Flag")
    writeSequenceToConsole("1", sequence: subject)
    subject.onNext("A")
    writeSequenceToConsole("2", sequence: subject)
    subject.onNext("B")
    subject.onComplete()

    /*
    ----BehaviorSubject star ----
    Subscription: 1, event: Next(Flag)
    Subscription: 1, event: Next(A)
    Subscription: 2, event: Next(A)
    Subscription: 1, event: Next(B)
    Subscription: 2, event: Next(B)
    Subscription: 1, event: Completed
    Subscription: 2, event: Completed
    ----BehaviorSubject end ----
    */
}
```

#### Variable
将BehaviorSubject 快速装包

// 具体实现代码如下

```swift
public var value: E {
    get {
        return lock.calculateLocked {
            return _value
        }
    }
    set(newValue) {
        lock.performLocked {
            _value = newValue
        }
        self.subject.on(.Next(newValue))
    }
}

```

```swift
 example(false, name: "Variable"){
     let subject = Variable("Flag")
     writeSequenceToConsole("1", sequence: subject)
     subject.value = "A"
     writeSequenceToConsole("2", sequence: subject)
     subject.value = "B"
     /*
     ----Variable star ----
     Subscription: 1, event: Next(Flag)
     Subscription: 1, event: Next(A)
     Subscription: 2, event: Next(A)
     Subscription: 1, event: Next(B)
     Subscription: 2, event: Next(B)
     ----Variable end ----
     */
 }

```

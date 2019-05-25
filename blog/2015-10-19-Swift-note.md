# Swift笔记
> 2015-10-19 15:10:10
###### 可选协议/协议拓展
`MyProtocol` 协议中`func requiredMethod()` 是在协议声明的时候定义的,但是`MyProtocol` 对其有一个默认实现,而`func optionalMethod()` 是在拓展中实现的,必须要有一个默认实现. 当`TestClass` 类被强转为 MyProtocol类型时,协议中声明的方法会被动态派发,但是协议拓展中的方法即使被重写仍然会调用默认实现.
###### **结论如下**
- 如果类型推断得到的是实际的类型
  - 那么类型中的实现将被调用；如果类型中没有实现的话，那么接口扩展中的默认实现将被使用
- 如果类型推断得到的是接口，而不是实际类型
  - 并且方法在接口中进行了定义，那么类型中的实现将被调用；如果类型中没有实现，那么接口扩展中的默认实现被使用
  - 否则 (也就是方法没有在接口中定义)，扩展中的默认实现将被调用
```swift
protocol MyProtocol{
    func requiredMethod()
}
extension MyProtocol{
    func requiredMethod(){
        print("Origin Method")
    }
    func optionalMethod(){
        print("Optional Method")
    }
}
class TestClass : MyProtocol {
    func requiredMethod() {
        print("Rewrite Require Method")
    }
    func optionalMethod() {
        print("Rewrite Optional Method")
    }
}
var temp = TestClass() as MyProtocol
temp.requiredMethod() //Rewrite Require Method
temp.optionalMethod() //Optional Method
```
###### 类型/协议 转换
###### **通用代码**
```swift
protocol Study{
    func helloWord() -> String
}
protocol NSStudy{
    func helloWord() -> NSString
}
class Father : Study,NSStudy{
    func sayName(name:String){
        print("Father : "+name)
    }
    func helloWord() -> String{
        return "HelloWord"
    }
    func helloWord() -> NSString{
        return NSString(string: "HelloWord")
    }
}
```
​	
```swift
class Son: Father {
    static func sayName(name:String){
        print("Son : "+name)
    }
        func gotoSchool(){
        print("Go to school")
    }
}
```
###### 操作符
###### 1. 判断 **是否为某个类或为某个类的子类** 或 **是否遵守某个协议**
```swift
var man:Father = Son()
var isSon = man is Son          //true
var canStudy = man is Study     //true
```
###### 2. 将某个类转换成另外一个类, 或者假设其遵守某个方法
```swift
//转换为某个类
if let success:() = (man as? Son)?.gotoSchool(){
    print("Success")
}else{
    print("Fail")
}
//执行不同协议中的同名方法
var str = (man as NSStudy).helloWord()
if str is NSString{
    print("Is NSString")
}
```
###### indirect
// **indirect** : adj. 间接的, 迂回的
对于 引用类型class ,包含自身类型的实例变量是很正常的,但是如果是值类型 Struct,enum 包含自身类型的实例变量,所以就要用indirect关键词标识,让编译器不要直接嵌套.(递归枚举,递归结构体)
```swift
//包含相关值的递归枚举
indirect enum LinkList<Element:Comparable>{
    case Empty
    case Node(Element,LinkList<Element>)
    func printList(){
        switch self{
        case let .Node(value,node):
            print(value)
            switch node{
            case .Node(_, _):
                node.printList()
            case .Empty:
                return
            }
        case .Empty:return
        }
    }
}
var list = LinkList.Node(1, LinkList.Node(2, LinkList.Node(3, LinkList.Node(4, LinkList.Empty))))
list.printList()
```
###### Where
where 通常在 Swift 中用作模式匹配,相当于筛选
> 模式匹配是数据结构中字符串的一种基本运算，给定一个子串，要求在某个字符串中找出与该子串相同的所有子串，这就是模式匹配
###### 使用场景
###### 1. Switch
```swift
var nums = ["A111","A222","B111","B222","C111","C222"]
nums.forEach {
    switch $0{
    case let x where x.hasPrefix("A"):print("A")
    case let x where x.hasPrefix("B"):print("B")
    default:print($0)
    }
}
//A
//A
//B
//B
//C111
//C222
```
###### 2. if
```swift
let dict : NSDictionary = ["key":"value","key2":"values"]
if let value :NSString = dict["key"] as? NSString where value.isEqualToString("value"){
    print("Same")
}else{
    print("Not Same")
}
```
###### 函数格式
**`权限修饰符`*(`public`,`internal`,`private`*)  `重写标志`(*`override`*)  `函数类型`(*`class`,`static`*)  `泛型<T> where condition` `(参数列表: var/let/inout (外部参数名) (内部参数名) : (参数类型)(?是否为可选))`  `异常抛出`(*`throws`*)  -> `返回值`**
###### 运算符函数
类和结构可以为现有的操作符提供自定义的实现，这通常被称为运算符重载(`overloading`)。运算符函数必须为全局函数
1. 运算符类型 在 func前加 : 前缀`prefix`、中间`infix` 或者 后缀`postfix`
2. 运算符命名 : 自定义运算符可以由以下其中之一的 ASCII 字符` /`、`=`、` -`、`+`、`!`、`*`、`%`、`<`、`>`、`&`、`|`、`^`、`?` 以及 `~`, 或者后面语法中规定的任一个 Unicode 字符开始。在第一个字符之后，允许使用组合型 Unicode 字符。也可以使用两个或者多个的点号来自定义运算符（比如, ....）。虽然可以自定义包含问号?的运算符，但是这个运算符不能只包含单独的一个问号。
###### 自定义运算符格式
```swift
<prefix/postfix/infix> operator <运算符> {
	associativity <结合方向>(left,right,none)
	precedence <优先级>(乘除150,加减140)
}
<prefix/postfix/infix> func <运算符> (left : <左> ,right : <右>) -> <返回值>{
    return <返回值>
}
```
###### **例子** 通过自定义运算符实现正则判断
```swift
enum RegexMode : String{
    case Mail = "^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$"
}
struct RegexHelper {
    let regex: NSRegularExpression
    init(_ pattern: String) throws {
        try regex = NSRegularExpression(pattern: pattern,options: .CaseInsensitive)
    }
    func match(input: String) -> Bool {
        let matches = regex.matchesInString(input,
            options: [],
            range: NSMakeRange(0, input.characters.count))
        return matches.count > 0
    }
}
infix operator =~ {
    associativity none
    precedence 130
}
infix operator ==~ {
    associativity none
    precedence 130
}
func =~ (resource : String ,regx : String) -> Bool{
    do{
        return try RegexHelper(regx).match(resource)
    }catch{
        return false
    }
}
func ==~ (resource : String ,regx : RegexMode) -> Bool{
    return resource =~ regx.rawValue
}
if "vfanx@qq.com" ==~ RegexMode.Mail
{
    print("有效的邮箱地址")
}
```
###### 可选链
###### 在可选链中调用函数
当可选链的结尾是一个函数的时候,这个函数的返回值也是一个可选类型,即使这个函数的返回值是 void(空元组),通过判断函数的返回值是否为空可以判断函数是否被执行
```swift
class Toy {
    var name : String
    init(name:String){
        self.name = name
    }
    func play(){
        print("play \(name)")
    }
}
class Pet {
    var toy : Toy?
}
class Child {
    var pet : Pet?
}
var xiaoming = Child()
xiaoming.pet = Pet()
//xiaoming.pet?.toy = Toy(name: "Car")
//xiaoming.pet?.toy?.play()
//闭包中的判断,即返回一个可选的空元组
var playClosure = {(child:Child) ->()? in
    child.pet?.toy?.play()
}
if let isPlay :() = xiaoming.pet?.toy?.play()
{
    print("Somthing Play")
}else{
    print("Nothing Play")
}
```
###### 可选类型数组
有时候我们可能会遇到数组元素的类型是可选类型,这时候我们遍历操作数组元素的时候每次进行值判断是很 Low 的,然后我们可以使用 `flatMap` 来对数组进行变形,同时还能对其进行值操作
```swift
let array : [[Int]?] = [[1,2,3],nil,[4,5,6],nil,[7,8,9],nil]
	
//此操作可以剔除数组中的 nil
let temp1 = array.flatMap{$0}
print(temp1)//[[1, 2, 3], [4, 5, 6], [7, 8, 9]]
	
//在此基础上可以进行可选链的操作
let temp2 = array.flatMap{$0?.reduce("", combine: {$0+String($1)})}
print(temp2)//["123", "456", "789"]
```
当处理一个非可选的元素为集合类型的数组时,其作用是 "拍扁"
```swift
let array2 : [[[Int]]] = [[[1],[2,3]],[[4,5],[6]],[[7,8,9]]]
let temp3 = array2.flatMap{$0.flatMap{$0}}
print(temp3)//[1, 2, 3, 4, 5, 6, 7, 8, 9]
```
###### 集合类型
###### 值类型与引用类型
- swift 中所有集合类型(Set,Array,Dictionary)都是值类型容器,值类型在传递赋值过程中需要进行拷贝.但是 swift 对其进行了优化.值类型赋值或传递过程中复制的行为并不是马上发生的,而是只当值发生改变时才会产生复制.Swift 内建的值类型的容器类型在每次操作(增,删,改)时都需要复制一遍，即使是存储的都是引用类型.
- 原来 Foundation 框架中的集合类型(NSSet,NSArray,NSDictionary) 都是引用类型的容器.
- 在实际开发中按照具体的数据规模和操作特点来决定到时是使用值类型的容器还是引用类型的容器：在**需要处理大量数据**并且**频繁操作 (增减) 其中元素时**，选择 NSMutableArray 和 NSMutableDictionary 会更好，而对于容器内条目小而容器本身数目多的情况，应该使用 Swift 语言内建的 Array 和 Dictionary。
###### 集合Set
  一个set无序的存储相同类型的不同的值.当一个数组元素的顺序不重要或者你需要保证这些value只出现一次的时候使用set.
###### 1. 语法
`Set<SomeType>`和`Array`不同的是,`Set`没有缩写方式.`var someSet =Set<Character>()`    或者如果上下文以及提供了类型信息,比如一个函数的参数或者一个已知类型的常量或变量.你可以创建用空的数组字面量创建一个空的集合   
```swift
var someSet =Set<Character>()// someSet现在包含一个Character的值
someSet.insert("a")// someSet现在是一个空的set,但是它仍然是一个存储Character的set.
var someSet:Set<String> = ["L","o","v","e"]
```
一个set不能单独的从数组字面量推断类型.所以set必须被明确的定义.然而根据swift的类型推断,当你用数组字面量初始化set的时候,如果包含的所以value是一种类型,你可以不写类型.
//判断一个set是否包含一个值
```swift
var isContainAValue = someSet.contains("o")
println("/(isContainAValue)")
```
//遍历一个set
```swift
for itemin someSet {
	println("/(item)")
}
// 因为set类型没有顺序.所以要按照一个指定的顺序遍历set要使用全局sorted函数.
for iteminsorted(someSet) {
	println("/(item)")
}
```
###### 2. Set关系
你可以效率很高的进行一下set操作.比如合并两个set.获取两个集合的相同部分.或者判断两个集合包含所以的,一些或者都不包含一些值.
```swift
var firstSet  : Set = [1,2,3,4]
var secondSet : Set = [1,3,5,7]
//并集: uionSet = A+B
var uionSet : Set = firstSet.union(secondSet)
//print(uionSet) [5, 7, 2, 3, 1, 4]
//交集: intersectSet = AB
var intersectSet : Set = firstSet.intersect(secondSet)
//print(intersectSet) [3, 1]
//subtract = A - AB
var subtract : Set = firstSet.subtract(secondSet)
//print(subtract) [2, 4]
//exclusiveOr = A+B - AB
var exclusiveOr : Set = firstSet.exclusiveOr(secondSet)
//print(exclusiveOr) [5, 7, 2, 4]
```
###### 3. Set 比较
```swift
var firstSet  : Set = [1,2,3,4]
var secondSet : Set = [1]
//相等 判断
var equal = (firstSet == secondSet)
//子集/超集 判断
var sonSet = firstSet.isSubsetOf(secondSet)
var superSet = firstSet.isSupersetOf(secondSet)
//相交 判断
var disJion = firstSet.isDisjointWith(secondSet)
//真子集/真超集 判断
var realSonSet = firstSet.isStrictSubsetOf(secondSet)
var realFatherSet = firstSet.isStrictSupersetOf(secondSet)
```
###### 数组 Array
###### 自定义下标
```swift
var array = [111,222,333,444,555]
extension Array{
    subscript(s inputs:Int...) -> ArraySlice<Element>{
        get{
            var newArray = ArraySlice<Element>()
            let count = self.count
            for indexNum in inputs
            {
                assert(indexNum < count, "Index out of range")
                newArray.append(self[indexNum])
            }
            return newArray
        }
        set{
            for (index,i) in inputs.enumerate() {
                assert(i < self.count, "Index out of range")
                self[i] = newValue[index]
            }
        }
    }
}
//使用区间
array[0...1] = [0,0]
print(array) // [0, 0, 333, 444, 555]
//使用自定义数组
array[s:0] = [123456789]
array[s:1,2,3] = [123,123,123]
print(array[s:1,2,3,4]) //[123, 123, 123, 555]
```
###### 字典 Dictionary
当使用系统 json解析器时,会返回Foundation类型,所以没办法用 Swif 值类型进行取值和判断
###### 对未知 Key 的 Value 的判断
###### 1. 传统判断
```swift
var json = "{\"str\":\"value\",\"dict\":{\"subStr\":\"value\"}}"
var data = json.dataUsingEncoding(NSUTF8StringEncoding)
if let jsonData = data
{
    do{
        var dict : NSDictionary = try NSJSONSerialization.JSONObjectWithData(jsonData, options: NSJSONReadingOptions.AllowFragments) as! NSDictionary
        if dict["str"] != nil && String(dict["str"]!) == "value"{
            print("equal")
        }else{
            print("error")
        }
    }catch{
        print(error)
    }
}
```
###### 2.高阶函数+可选链
```swift
var dict : NSDictionary = ["value":"key"]
let result = (dict["value"] as? NSString).map{String($0) == "key"}
if result != nil && result!{
    print("Success")
}else{
    print("Error")
}
```
###### 3. 值类型判断
```swift
var dict = ["value":"key"]
if dict["values"] == "key"{
    print("Success")
}else{
    print("Error")
}
```
###### 4.where 操作符
```swift
let dict : NSDictionary = ["key":"value","key2":"values"]
if let value :NSString = dict["key"] as? NSString where value.isEqualToString("value"){
    print("Same")
}else{
    print("Not Same")
}
```
###### 高阶函数
```swift
var array = [1,2,3,4,5,6,0]
var muArray = [[1,2,3],[4,5,6],[7,8,9]]
```
###### 1. Short:排序
```swift
var sortArray = array.sort({$0>$1})
//print(sortArray)
//[6, 5, 4, 3, 2, 1, 0]
```
```swift
//InPlace:无返回值,直接改变当前实例
var sortInPlaceArray = array
sortInPlaceArray.sortInPlace({$0>$1})
//print(sortInPlaceArray)
//[6, 5, 4, 3, 2, 1, 0]
```
###### 2. Map:转换
```swift
var mapArry = array.map {"No." + String($0)}
//print(mapArry)
//["No.1", "No.2", "No.3", "No.4", "No.5", "No.6", "No.0"]
```
###### 3. Filter:过滤
```swift
var filterArray = array.filter {($0%2 == 0)}
//print(filterArray)
//[2, 4, 6, 0]
```
###### 4. Reduce:归纳
```swift
var reduceArray = array.reduce("", combine: {$0+"."+String($1)})
//print(reduceArray)
//.1.2.3.4.5.6.0
```
###### 5. Flatten
```swift
var flattenArray =  muArray.flatten()
print(flattenArray)
```
###### 自动闭包
**@autoclosure 做的事情就是把一句表达式自动地封装成一个闭包 (closure)。**
​    
###### **例子:**自定义逻辑与运算符
```swift
infix operator ||| { associativity left precedence 140}
//1.**使用自动闭包版**
​    
func ||| (@autoclosure left:()->Bool,@autoclosure right:()->Bool) -> Bool{
    if left(){
        return true
    }else
    {
        return right()
    }
}
​    
//2.**不使用闭包版**
​    
func ||| ( left:Bool, right:Bool) -> Bool{
    return left || right
}
//3.**测试**
	var a = 2
	if (++a > 2) ||| (++a > 2){
	    print("a= (a)")
	}else
	{
	    print("a= (a)")
	}
	//1.使用闭包: a = 3
	//2.不使用闭包: a = 4
	//结论: 使用闭包可以减少(延迟)计算,使得计算在真正需要的时候才使用
```
 
​    
###### try-catch
1 .  对于可能抛出错误的函数不能直接调用,一定要用 try
​        
2 . 对于非同步的 API 来说，抛出异常是不可用的 -- 异常只是一个同步方法专用的处理机制。Cocoa 框架里对于异步 API 出错时，保留了原来的 NSError 机制
但是我们可以采用下列方法解决,创建一个泛型枚举作为容器
```swift
enum Result<T>{
    case Success(T)
    case Error(NSError)
}
​    
func doSomeAsyncThing()-> Result<String>{
    //处理一些非同步的事情
    var asyncResult = false
    let asyncValue : String? = nil
    let asyncError : NSError? = nil
    if asyncResult{
        return Result.Success(asyncValue!)
    }else{
        return Result.Error(asyncError!)
    }
}
```
3 . 对于可以忽视错误类型的异常可以采用 if+可选绑定 进行,对于保证不会出错的也可以采用!进行强制解析
```swift
enum CommonError : ErrorType
{
    case Error
    case Warning
}
​    
func doSomeThingMayBeWrong(success:Bool) throws -> String{
    if success{
        return "Success"
    }else{
        throw CommonError.Error
    }
}
```
​	
```swift
//1. 强制解析:保证不发生错误情况下使用,当抛出错误时应用会崩溃
let result = try! doSomeThingMayBeWrong(true)
print(result)
​    
//2. 可选绑定
if let result = try? doSomeThingMayBeWrong(false){
    print(result)
}else{
    print("Error")
}
//Success
//Error
```
4 . 在可以 throw 的方法中永远不能返回一个可选类型,因为结合 try? 使用的话会产生双重 Optional
```swift
func methodThrowsWhenPassingNegative1(number: Int) throws -> Int? {
    if number < 0 {
        throw Error.Negative
    }
    if number == 0 {
        return nil
    }
    return number
}
​    
//这里 num 在解包后仍然是一个可选类型
if let num = try? methodThrowsWhenPassingNegative1(0) {
    print(num.dynamicType)
} else {
    print("failed")
}
```
​    
###### 断言
断言只有在 Debug 编译的时候有效，而在运行时是不被编译执行的，因此断言并不会消耗运行时的性能。这些特点使得断言成为面向程序员的在调试开发阶段非常合适的调试判断，而在代码发布的时候，我们也不需要刻意去将这些断言手动清理掉，非常方便
```swift
func assert(@autoclosure condition: () -> Bool,
            @autoclosure _ message: () -> String = default,
                              file: StaticString = default,
                              line: UInt = default)
```
​    
###### fatalError
在调试时我们可以使用断言来排除类似s数组越界问题，但是断言只会在 Debug 环境中有效，而在 Release 编译中所有的断言都将被禁用。在遇到确实因为输入的错误无法使程序继续运行的时候，我们一般考虑以产生致命错误 (fatalError) 的方式来终止程序
`@noreturn` 表示这个函数可以不要返回值,因为程序整个都将终止。这可以帮助编译器进行一些检查，比如在某些需要返回值的 switch 语句中，我们只希望被 switch 的内容在某些范围内，那么我们在可以在不属于这些范围的 default 块里直接写 fatalError 而不再需要指定返回值
假如父类中有必须重写的方法,可以用`fatalError` 来标识提醒重写
```swift
@noreturn func fatalError(@autoclosure message: () -> String = default,
                                          file: StaticString = default,
                                          line: UInt = default
```
###### LOCK
###### 1. Objective-C 版本
 `@synchronized`，这个关键字可以用来修饰一个变量，并为其自动加上和解除互斥锁。这样，可以保证变量在作用范围内不会被其他线程改变。
###### **写法1**:
```swift
- (void)myMethod:(id)anObj {
    @synchronized(anObj) {
        // 在括号内 anObj 不会被其他线程改变
    }
  }.
```
  由于@synchronized的实际作用如下
###### **写法2**:
```swift
- (void)myMethod:(id)anObj {
  objc_sync_enter(anObj)
       // 在 enter 和 exit 之间 anObj 不会被其他线程改变
  objc_sync_exit(anObj)
  }
```
###### 2. Swift 版本
然后由于`@synchronized`在swift中已经取消,所以我们可以使用写法2来写,为了方便使用,可以采用闭包封装
```swift
func synchronized(lockObject:AnyObject?,closure:()->()){
	objc_sync_enter(lockObject)
	closure()
	objc_sync_exit(lockObject)
}
//调用时可以采用尾随闭包
var str = "HelloWord"
synchronized(str){
       // 在闭包内str不会被其他线程改变
}
```
###### GCD
###### GCD 延时实例
```swift
typealias Task = (cancel : Bool) -> Void
​    
func dispatch_task_delay(queue:dispatch_queue_t,time:NSTimeInterval, task:dispatch_block_t) ->  Task? {
​    
    func dispatch_later(block:dispatch_block_t) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW,Int64(time * Double(NSEC_PER_SEC))),queue,block)
    }
    
    // 实际输入的需要执行的闭包
    var closure: dispatch_block_t? = task
    //需要返回的闭包的应用
    var result: Task?
    
    //参数为 Bool 返回值为空的闭包队列实际加载的闭包,作为实际返回值,捕获了实际需要执行的闭包,同时也捕获了自身
    let delayedClosure: Task = { cancel -> Void in
        if let internalClosure = closure {
            if (cancel == false) {
                dispatch_async(queue, internalClosure);
            }
        }
        closure = nil
        result = nil
    }
    
    result = delayedClosure
    
    //函数体实际执行的代码,
    dispatch_later {
        if let delayedClosure = result {
            delayedClosure(cancel: false)
        }
    }
    
    return result;
}
​    
func dispatch_task_delay_main(time:NSTimeInterval, task:dispatch_block_t) -> Task? {
    return dispatch_task_delay(dispatch_get_main_queue(), time: time, task: task)
}
```
​	
```swift
func dispatch_task_cancel(task:Task?) {
    task?(cancel: true)
}
```
###### **Selector**
1. 可以用字符串直接初始化 `let selector : Selector = "viewDidLoad"`
2. 不能直接对`private` 关键词修饰的函数创建`Selector`,需要在`private`加@`objc` 关键词修饰
###### **方法的动态调用**
通过创建 类/实例 的柯里化函数,实现方法的动态调用
```swift
	class TempClass {
	    class func classFunc() {
	        print("Class Func")
	    }
	    func instanceFunc(){
	        print("Instance Func")
	    }
	}
	​    
	// 获取类型的柯里化函数
	var classMethod = TempClass.classFunc
	//执行类型的柯里化函数 : 类型 + 柯里化函数 + (参数列表)
	TempClass.classFunc()
```
​		
```swift
	// 获取实例的柯里化函数
	var instanceMethod = TempClass.instanceFunc
	var temp = TempClass()
	​    
	//执行实例的柯里化函数 : 柯里化函数 + (实例) + (参数列表)
	instanceMethod(temp)()
```
###### **单例**
由于 Swift 支持类存储变量所以无需使用 GCD 即可创建一个线程安全的单例
- `private` 修饰符 : 外界无法通过 Getter 方法获得,只能通过指定类方法获得
- `static`   修饰符 : 表明这是一个类型变量
- `let`        修饰符 : 防止单例被意外修改
ps: 子类继承父类后 类存储变量仍然为同一份
```swift
class Instance {
    private static let defaultInstance = Instance()
    static func shareInstance() -> Instance{
        return defaultInstance
    }
}
```
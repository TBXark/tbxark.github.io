# 让我们细数 iOS 开发中那些坑爹的变量的默认值
> 2016-12-12 01:23:00

---

### 1. `automaticallyAdjustsScrollViewInsets`

`automaticallyAdjustsScrollViewInsets` 其实是一个很有用的属性, 当 vc 含有 navigationbar 或者 tabbar 的时候, 且他们为不透明状态, vc 就会调整第一个 scrollerView 的 insets 值, 使得这些 bar 不会对 scrollerView 造成遮挡.
而且这个属性的值默认是 `true`, 然后有得时候就会发生一些奇怪的问题, 比如我的这篇文章 -> [写 PinterestSegement 中发现的一个问题](/2016/12/08/2016-12-08-Swift-Pinterst/)

### 2. `translatesAutoresizingMaskIntoConstraints`

iOS 的布局方式3种, 直接设置 frame, Autoresizing, Autolayout. 当 `translatesAutoresizingMaskIntoConstraints` 为 `true` 的时候, 系统就会自动的将 `autoresizingMask` "翻译" 成以约束为基础的布局, 而且 `translatesAutoresizingMaskIntoConstraints` 的默认值是 `true`

比如说一下这段代码

```objective-c
class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        let testView = UIView(frame: CGRect(x: 0, y: 0, width: 50, height: 50))
        testView.backgroundColor = UIColor.red
        view.addSubview(testView)
        print(testView.constraints)
      }
}
// 输出: []
// 注意这里的输出是空数组
```
然后打开 Xcode 的 调试窗口看
![](./images/2016-12-16-translatesAutoresizingMaskIntoConstraints-001.png)
然后发现, 实际上它已经加了很多约束, 而且这些约束能准确的描述该 view 的大小和未知了

假如我们这时候给这个 view 手动的加上约束, 如下

```objective-c

class ViewController: UIViewController {


    override func viewDidLoad() {
        super.viewDidLoad()

        let testView = UIView(frame: CGRect(x: 0, y: 0, width: 50, height: 50))
        testView.backgroundColor = UIColor.red
        view.addSubview(testView)
        print(testView.constraints)


        view.addConstraints( NSLayoutConstraint.constraints(withVisualFormat: "H:|-100-[testView(==100)]", options: NSLayoutFormatOptions(rawValue: 0), metrics: nil, views: ["testView": testView]));

        view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "V:|-100-[testView(==100)]", options: NSLayoutFormatOptions(rawValue: 0), metrics: nil, views: ["testView": testView]));

        print(view.constraints)
    }
}

```

这时候, 控制台就会打印出一堆错误提示约束有冲突了
这时其实只要把 `translatesAutoresizingMaskIntoConstraints` 设置成 `false`, view 就不会自己生成约束而是要程序员手动的去完善.
ps: 当使用 sb/xib 添加约束的时候, 系统会自动的把 `translatesAutoresizingMaskIntoConstraints` 设置成 `false`, 或者使用 `snpkit` 等第三方库是也不用考虑这个问题


**更新中,欢迎一起完善**


# 使用泛型优化 UITableviewCell 的重用
> 2016-06-10 01:50:10

---


在通常情况下我们 tableview 的 datasource 的写法是

 ```
 tableView.dequeueReusableCellWithIdentifier("Iden", forIndexPath: indexPath)
 ```

使用这个函数返回的值是一个 `UITableView`, 当我们使用自定义的 TableViewCell 式要对其进行一次强制类型转换, 如下:

 ```
 tableView.dequeueReusableCellWithIdentifier("Iden", forIndexPath: indexPath) as! TableViewCell
 ```



虽然我不推荐在代码中使用强制类型转换,但是在我们能肯定类型的时候使用强制类型转化可以使得代码更加简洁

那么, 能不能用泛型来修改这一段代码呢? 让函数的返回值直接是我们想要的 Cell 的类型而不用我们强制类型转换, 然后我们就试一下将泛型作为函数的返回值

```
func foo<T>() -> T
```

然后我们就是用类拓展来增加一个重用 TableViewCell 的方法, 如下: 

```
extension UITableView {
    func dequeueCustomCellWithIdentifier<T: UITableViewCell>(identifier: String, forIndexPath indexPath: NSIndexPath) -> T {
        return dequeueReusableCellWithIdentifier(identifier, forIndexPath: indexPath) as! T
    }
}
```

然后我们来测试一下这段代码的可行性

```
let cell = tableView.dequeueCustomCellWithIdentifier<TableViewCell>("Cell", forIndexPath:indexPath)
```
是不是报错了呢, 其实返回值是泛型的函数真正的调用方法是: 

```
let cell: TableViewCell = tableView.dequeueCustomCellWithIdentifier("Cell", forIndexPath:indexPath)
```

既然类型转换都省了, 那么 `identifier` 能不能也省略呢, 通常情况下, 我们的 `identifier` 只是为了区分不同的 cell, 相同类型的 cell 使用不同的 iden 的使用常见还是比较少见的, 所以我们就极端一点,直接使用 类型作为 Cell 的 `identifier`, 然后我们就有了下面的代码: 

```
extension NSObject {
    static var iden: String {
        return NSStringFromClass(self)
    }
}

extension UITableView {
    func registerCustomClass(cellClass: AnyClass?) {
        registerClass(cellClass, forCellReuseIdentifier: cellClass?.iden ?? "")
    }

    func dequeueCustomCellWithIdentifier<T: UITableViewCell>(forIndexPath indexPath: NSIndexPath) -> T {
        return dequeueReusableCellWithIdentifier(T.iden, forIndexPath: indexPath) as! T
    }
}
```
所以我们在注册/重用 cell  的时候就可以这么写

```
 tableView.registerCustomClass(TableViewCell.self)
 
```
```
 let cell: TableViewCell = tableView.dequeueCustomCellWithIdentifier(forIndexPath: indexPath)
```

按照这个思路, 我们可以将响应的注册重用 Header, Footer 和 UICollectionView 的代码写出来



ps:

原来之前已经有人把这个想法封装成了一个库, 而且比我写得要全面

[Reusable http://https://github.com/AliSoftware/Reusable ](http://https://github.com/AliSoftware/Reusable)



 

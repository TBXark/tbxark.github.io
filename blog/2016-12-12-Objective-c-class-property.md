# Objective-C 的类变量
> 2016-12-12 01:23:00

---

惊闻 OC 支持类变量, 然后用个 demo 测试了一下
发现只是 `property` 加上了 `class` 类型, 但是实际的上还是要手写 静态变量和 `getter` 和 `setter` 方法的实现.
所以 Objective-C 的类变量 只是代替 头文件中 `getter` 和 `setter` 方法的声明.

```objective-c
@interface Test : NSObject

@property (class, nonatomic, copy) NSString * name;
//+ (NSString *)name;
//+(void)setName:(NSString *)name;
@end

@implementation Test
@dynamic name;
static NSString *_name = nil;
+ (NSString *)name {
    return _name;
}
+(void)setName:(NSString *)name {
    _name = name.copy;
}

@end

```


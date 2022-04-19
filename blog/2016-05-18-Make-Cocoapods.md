# 超快速为自己的 Github 项目创建 Cocoapods 仓库
> 2016-05-18 14:50:00 

---


Long long times ago, 木噶西木噶西, 创建一个 cocoapods 仓库  是相当的麻烦,到底有多麻烦呢, 就是麻烦到我都忘记是怎么创建的了.最近心血来潮就想把自己的开源项目(很水的)都加上 cocoapod.
然后我就发现了一种新的创建 pod 仓库的方法(ps: 其实是久的方法, 但是我不知道而已)



### 1. 注册trunk

#### 1. 更新到 `0.35.0` 以上的 Cocoapod
ps: 但是推荐不要升级到最新的测试版, 那个都是坑啊. 

`sudo gem install cocoapods`

#### 2. 发送注册请求

`pod trunk register E-MAIL 'USER_NAME'  —verbose`

然后就去邮箱验证,我的 outlook 邮箱会把它识别为垃圾邮件, 收不到邮件的可以去垃圾箱里面找一下

#### 3. 上传自己的代码,并且打上 tag

这一部分都是 gti 的基本操作,就不赘述了

----

### 2. 创建podspec文件

这里不推荐用 `pod spec create PROJECT_NAME` 创建, 因为太多了, 有用信息其实只有一点
但是感兴趣的话可以用这个命令来创建, 查看完整版的 podspec 文件


#### 1. 创建 podspec 文件
注意,这里文件名字就是仓库的名字,不一定要跟项目的名字或者github一样.但是不能和已有的 pod 仓库重复.

#### 2. 填写 podspec 文件

```
Pod::Spec.new do |s|
  s.name         = "PROJECT_NAME" #* 要和文件名一样
  s.version      = "1.0.2" #* 版本号
  s.summary      = "SUMMARY" # 简介
  s.homepage     = "https://github.com/xxx/xxx" # 主页
  s.license      = { :type => 'MIT License', :file => 'LICENSE' } # 协议
  s.author       = { "USER_NAME" => "E-MAIL" } # 作者
  s.source       = { :git => "https://github.com/xxxx/xxx.git", :tag => s.version } #* github源 
  s.platform     = :ios, '8.0' # 平台,系统版本
  s.source_files = 'Classes/*.swift' # 源代码文件,及路径
  s.requires_arc = true # ARC 支持
end

```

其中我打了 `*` 是最重要的,  `source_files` 文件路径一定要填对

#### 3. 上传 podspec 文件
`pod trunk push PROJECT_NAME.podspec`

上传上去, 假如编译有问题或者有其他 pod 方面的问题的话,按照提示修改就可以了

  

  

  


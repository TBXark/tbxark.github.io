function handleInput(e) {
  if (e.keyCode == 13) {
      var inputbar = document.getElementById("cmdinput");
      var argv = inputbar.value;
      inputbar.value = '';
      handleCommand(argv)
  }
}
function startInput() {
    document.getElementById("cmdinput").focus()
}
function handleCommand(cmd) {
  var html = ''
  html += '<p class="command">guest@tbxark:~$ ' + cmd + '</p>'
  switch (cmd) {
      case "projects":
          html += '' +
              '<p class=\"command\"> https://github.com/TBXark/TKRubberIndicator -> <a class=\"file\" href=\"https://github.com/TBXark/TKRubberIndicator\">TKRubberIndicator</a></p>' +
              '<p class=\"command\"> https://github.com/TBXark/TKSwitcherCollection  -> <a class=\"file\" href=\"https://github.com/TBXark/TKSwitcherCollection\">TKSwitcherCollection</a></p>' +
              '<p class=\"command\"> https://github.com/TBXark/TKRadarChart  -> <a class=\"file\" href=\"https://github.com/TBXark/TKRadarChart\">TKRadarChart</a></p>' +
              '<p class=\"command\"> https://github.com/TBXark/TKDotSegment -> <a class=\"file\" href=\"https://github.com/TBXark/TKDotSegment\">TKDotSegment</a></p>' +
              '<p class=\"command\"> https://github.com/TBXark/PinterestSegment -> <a class=\"file\" href=\"https://github.com/TBXark/PinterestSegment\">PinterestSegment</a></p>' +
              '<p class=\"command\"> https://github.com/TBXark/Ruler -> <a class=\"file\" href=\"https://github.com/TBXark/Ruler\">Ruler</a></p>' 
          break
      case "blog":
          html += '' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2017-09-26 12:00:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2017-09-26-ARuler.md"> Ruler</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2017-02-18 14:48:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2017-02-180-My-LeetCode-Project.md"> LeetCode</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2017-01-27 22:20:55  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2017-01-27-MinesWeeping.md"> 简易扫雷游戏</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-12-12 01:23:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-12-16-fxxk-property.md"> 让我们细数 iOS 开发中那些坑爹的变量的默认值</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-12-12 01:23:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-12-12-Objective-c-class-property.md"> Objective-C 的类变量</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-12-08 01:23:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-12-08-Swift-Pinterst.md"> 写 PinterestSegement 中发现的一个问题</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-08-12 01:30:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-08-12-Android-quick-viewholder.md"> Android - 通用 Viewholder</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-07-31 01:23:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-07-31-Nodejs-Spider.md"> 用 Node.js 写简易爬虫</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-06-10 01:50:10  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-06-10-TableViewWithT.md"> 使用泛型优化 UITableviewCell 的重用</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2016-05-18 14:50:00  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2016-05-18-Make-Cocoapod.md"> 超快速为自己的 Github 项目创建 Cocoapod 仓库</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2015-10-29 15:08:27  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2015-10-29-RxSwift-note.md"> RxSwift 笔记</a></p>' +
          '<p class="command"> rw-r--r-- 1 Tbxark staff  2015-10-19 15:10:10  <a class="file" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/2015-10-19-Swift-note.md"> Swift笔记</a></p>'
          break
      case "ls":
          html += '' +
              '<p class=\"command\">' +
              '<a class=\"exe\" href=\"https://github.com/tbxark\">github</a>' +
              '<a class=\"exe\" href=\"https://twitter.com/tbxark\">twitter</a>' +
              '<a class=\"exe\" href=\"https://weibo.com/tbxark\">weibo</a>' +
              '<a class=\"exe\" onclick=\"return handleCommand(\'projects\')\">projects</a>' +
              '<a class=\"exe\" onclick=\"return handleCommand(\'blog\')\">blog</a>' +
              '</p>'
          break
      case "clear":
          var target = document.getElementById("cmd-history");
          target.innerHTML = ""
          html = ""
          break
      case "github":
          window.location = "https://github.com/tbxark"
          break
      case "twitter":
          window.location = "https://twitter.com/tbxark"
          break
      case "weibo":
          window.location = "https://weibo.com/tbxark"
          break
      default:
          html += '<p class="command">ERROR: unknow command</p>'
          break
  }
  addCmdResult(html)
}
function addCmdResult(html) {
  var origin = document.getElementById("cmd-history").innerHTML
  document.getElementById("cmd-history").innerHTML = origin + html
}
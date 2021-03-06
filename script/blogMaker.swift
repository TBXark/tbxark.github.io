import Foundation
let path = "/Users/Tbxark/Desktop/TBXark/Project/tbxark.github.io/blog"

func getAllFilePath(_ dirPath: String) -> [String] {    
    guard let array = try? FileManager.default.contentsOfDirectory(atPath: dirPath) else {
        return []
    }
    var filePaths = [String]()
    for fileName in array {
        var isDir: ObjCBool = true
        let fullPath = "\(dirPath)/\(fileName)"
        if FileManager.default.fileExists(atPath: fullPath, isDirectory: &isDir) {
            if isDir.boolValue {
                filePaths.append(contentsOf: getAllFilePath(fullPath) ?? [])
            } else {
                filePaths.append(fullPath)
            }
        }
    }
    return filePaths
}

let paths = getAllFilePath(path).filter({ $0.hasSuffix(".md")})
print(paths)

for subPath in paths.sorted().reversed() {
    let file = (try? String.init(contentsOfFile: subPath)) ?? ""
    let lines = file.split(separator: "\n")
    let name = lines[0].dropFirst()
    let time = lines[1].dropFirst()
    let fileName = subPath.split(separator: "/").last ?? ""
    print("'<p class=\"command\"> rw-r--r-- 1 Tbxark staff \(time)  <a class=\"file\" href=\"https://github.com/TBXark/tbxark.github.io/blob/master/blog/\(fileName)\">\(name)</a></p>' +")
}

print(Date().timeIntervalSince1970)
import Foundation

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
                filePaths.append(contentsOf: getAllFilePath(fullPath))
            } else {
                filePaths.append(fullPath)
            }
        }
    }
    return filePaths
}

if let idx = CommandLine.arguments.firstIndex(of: "-p") {
    let path = CommandLine.arguments[idx + 1]
    let paths = getAllFilePath(path).filter({ $0.hasSuffix(".md")})
    for subPath in paths.sorted().reversed() {
        let file = (try? String.init(contentsOfFile: subPath)) ?? ""
        let lines = file.split(separator: "\n")
        let name = lines[0].dropFirst()
        let time = lines[1].dropFirst()
        let fileName = subPath.split(separator: "/").last ?? ""
        print("'<p class=\"cmd-text\"> rw-r--r-- 1 Tbxark staff \(time)  <a class=\"file\" href=\"https://github.com/TBXark/tbxark.github.io/blob/master/blog/\(fileName)\">\(name)</a></p>' +")
    }
}


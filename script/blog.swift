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

struct Blog: Codable {
    var title: String
    var fileName: String
    var date: String
}

if let idx = CommandLine.arguments.firstIndex(of: "-p") {
    let path = CommandLine.arguments[idx + 1]
    let paths = getAllFilePath(path).filter({ $0.hasSuffix(".md")})
    var blogs = [Blog]()
    for subPath in paths.sorted().reversed() {
        let file = (try? String.init(contentsOfFile: subPath)) ?? ""
        let lines = file.split(separator: "\n")
        let name = lines[0].dropFirst()
        let time = lines[1].dropFirst()
        let fileName = subPath.split(separator: "/").last ?? ""

        let blog = Blog(title: String(name), fileName: String(fileName), date: String(time))
        blogs.append(blog)
    }
    let encoder = JSONEncoder()
    encoder.outputFormatting = .prettyPrinted
    let data = try! encoder.encode(blogs)
    let json = String(data: data, encoding: .utf8)!
    print(json)
}


// swift ./script/blog.swift -p $(pwd)/blog > ./terminal/blog.json
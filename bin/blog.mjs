import { argv } from "zx";
import "zx/globals";


let b = argv.b
let t = argv.t

if (b && t) {

    b = path.resolve(b)
    t = path.resolve(t)

    const files = fs.readdirSync(b).filter((file) => file.endsWith(".md"))  
    let blogs = []
    
    for (const file of files) {
        const content = await fs.readFile(`${b}/${file}`, "utf8");
        const lines = content.split("\n");
        const title = lines[0].replace("# ", "");
        const date = lines[1].replace("> ", "");   
        blogs.push({
            title: title,
            date: date,
            fileName: file,
        })
    }  
    
    blogs = blogs.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    const fileContent = JSON.stringify(blogs, null, 2);
    fs.writeFileSync(t, fileContent);
}


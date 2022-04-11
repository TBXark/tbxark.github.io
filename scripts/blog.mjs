#!/usr/bin/env zx

// import "zx/globals";


const files = fs.readdirSync("../blog").filter((file) => file.endsWith(".md"))  
let blogs = []

for (const file of files) {
    const content = await fs.readFile(`../blog/${file}`, "utf8");
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
fs.writeFileSync("../database/blogs.json", fileContent);
import fs from "fs";
import path from "path";
import { parseArgs } from "./utils.js";

const argv = parseArgs();
let blogOption = argv.b || './blog';
let targetOption = argv.t || './api/blogs.json';
let blogs = [];

if (blogOption) {
  blogOption = path.resolve(blogOption);
  const files = fs.readdirSync(blogOption).filter((file) => file.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(`${blogOption}/${file}`, 'utf8');
    const l = content.split('\n');
    const title = l[0].startsWith('#') ? l[0].replace(/# */g, '') : null;
    const date = l[1].startsWith('>') ? l[1].replace(/> */g, '') : null;
    if (title && date) {
      blogs.push({
        title: title,
        date: date,
        fileName: file,
      });
    }
  }

  blogs = blogs.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  let readme = '# Blogs\n\n';
  for (const blog of blogs) {
    readme += `* [${blog.title}](${blog.fileName})\t${blog.date}\n`;
  }
  fs.writeFileSync(`${blogOption}/README.md`, readme);
}

if (targetOption) {
  targetOption = path.resolve(targetOption);
  const fileContent = JSON.stringify(blogs, null, 2);
  fs.writeFileSync(targetOption, fileContent);
}

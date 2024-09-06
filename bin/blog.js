import { argv } from "zx";
import "zx/globals";

let b = argv.b;
let t = argv.t;
let blogs = [];

if (b) {
  b = path.resolve(b);
  const files = fs.readdirSync(b).filter((file) => file.endsWith('.md'));

  for (const file of files) {
    const content = await fs.readFile(`${b}/${file}`, 'utf8');
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
  fs.writeFileSync(`${b}/README.md`, readme);
}


if (t) {
  t = path.resolve(t);
  const fileContent = JSON.stringify(blogs, null, 2);
  fs.writeFileSync(t, fileContent);
}

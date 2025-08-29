import fs from 'fs';
import https from 'https';


function fetchFileSHA(repo, filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/commits?path=/${filePath}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Webkit',
      },
    }; ``;
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        data = JSON.parse(data);
        resolve(data[0].sha.substring(0, 7));
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

const repo = 'TBXark/tbxark.github.io';
const styleSHA = await fetchFileSHA(repo, 'src/home.css');
const scriptSHA = await fetchFileSHA(repo, 'src/terminal.js');

const indexHTML = fs.readFileSync('index.html', 'utf8')
  .replace('__STYLE_SHA__', styleSHA)
  .replace('__SCRIPT_SHA__', scriptSHA);

fs.writeFileSync('index.html', indexHTML);

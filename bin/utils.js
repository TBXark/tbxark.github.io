import readline from "readline";
import crypto from 'crypto';
import fs from 'fs';

export function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      const key = args[i].substring(1);
      parsed[key] = args[i + 1] || true;
      i++;
    }
  }
  return parsed;
}

export function question(questionText, options = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(questionText, (answer) => {
      rl.close();
      if (options.choices && !options.choices.includes(answer)) {
        console.log(`Please choose from: ${options.choices.join(', ')}`);
        resolve(question(questionText, options));
      } else {
        resolve(answer);
      }
    });
  });
}

export function fetchFileSHA(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');      

      const hash = crypto.createHash('sha1');
      hash.update(fileContent);
      const sha = hash.digest('hex');
      
      resolve(sha.substring(0, 7));
    } catch (err) {
      reject(err);
    }
  });
}

export async function fetchRepos(username, token) {
  username = encodeURIComponent(username);
  const store = {};
  let page = 0;
  while (true) {
    let response = await fetch(
      `https://api.github.com/search/repositories?q=user%3A${username}&page=${page}`,
      {
        method: 'GET',
        headers: { Authorization: `token ${token}` },
      },
    );
    response = await response.json();
    const total = response.total_count;
    response = response.items;
    if (response.length === 0) {
      break;
    }
    for (const repo of response) {
      store[repo.name] = repo;
    }
    page += 1;
    if (Object.keys(store).length >= total) {
      break;
    }
  }

  return store;
}

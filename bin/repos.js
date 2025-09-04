import fs from "fs";
import path from "path";
import { parseArgs, question, fetchRepos } from "./utils.js";

const argv = parseArgs();
let targetOption = argv.t || './api/repos.json';

if (targetOption) {
  targetOption = path.resolve(targetOption);

  let repos = await fetchRepos('tbxark', process.env.HOMEBREW_GITHUB_API_TOKEN);
  repos = Object.values(repos)
    .filter((repo) => repo.visibility === 'public')
    .filter((repo) => repo.archived === false)
    .sort((a, b) => {
      return b.stargazers_count - a.stargazers_count;
    });
  const yesOrNoChoices = { choices: ['y', 'Y', 'n', 'N'] };
  const yesOrNoToBoolean = { y: true, n: false, Y: true, N: false };
  const visableRepos = [];
  for (const repo of repos) {
    const show = await question(`Show ${repo.name}? (y/n): `, yesOrNoChoices);
    if (yesOrNoToBoolean[show]) {
      visableRepos.push({
        name: repo.name,
        link: repo.html_url,
        description: repo.description,
      });
    }
  }

  const fileContent = JSON.stringify(visableRepos, null, 2);
  fs.writeFileSync(targetOption, fileContent);
}

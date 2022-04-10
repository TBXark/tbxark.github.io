#!/usr/bin/env zx

// import "zx/globals";

async function fetchRepos(username, token) {
    let store = {};
    let page = 0;
  
    while (true) {
      let response = await fetch(
        `https://api.github.com/search/repositories?q=user%3A${encodeURIComponent(
          username
        )}&page=${page}`,
        {
          method: "GET",
          headers: { Authorization: `token ${token}` },
        }
      );
      response = await response.json();
      const total = response.total_count;
      response = response.items;
      if (response.length == 0) {
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
  

let repos = await fetchRepos("tbxark", process.env.HOMEBREW_GITHUB_API_TOKEN);
repos = Object.values(repos).filter(repo => repo.visibility === "public")
.filter(repo => repo.archived === false)
.sort((a, b) => {
    return b.stargazers_count - a.stargazers_count;
});
const yesOrNoChoices = { choices: ["y", "Y", "n", "N"] };
const yesOrNoToBoolean = { y: true, n: false, Y: true, N: false };
const visableRepos = []
for (const repo of repos) {
    const show = await question(`Show ${repo.name}? (y/n): `, yesOrNoChoices);
    visableRepos.push({
        name: repo.name,
        link: repo.html_url,
    })
}

const fileContent = JSON.stringify(visableRepos, null, 2)
fs.writeFileSync("../terminal/projects.json", fileContent);
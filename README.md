# TBXark' blog

![](/assets/preview.png)


### Usage
```bash
# NPM Scripts (Recommended)
npm run dev      # Build and serve on localhost
npm run build    # Build the site (merge data + update SHA)
npm run preview  # Serve on localhost
npm run blogs    # Create /api/blogs.json
npm run projects # Create /api/projects.json
npm run merge    # Merge API data into /src/data.js
npm run lint     # Run ESLint

# Legacy Makefile support
make preview # serve on localhost
make build # build the site for cloudflare page
make blogs # create /api/blogs.json
make projects # create /api/projects.json
```

### Architecture
- **No Runtime Fetch**: API data is pre-compiled into `/src/data.js` at build time
- **ES6 Modules**: Uses modern JavaScript module system for better performance
- **Build-time Optimization**: All JSON files are merged and embedded during build


### Feature
- Support `tab` to complete the command
- Support `up` and `down` to navigate the command history


### Support commands
```bash
pwd # current domain
ls # list supported commands
github # open github
weibo # open weibo
twitter # open twitter
blogs # list blogs
projects # list projects
```


### Links

Origin: https://www.tbxark.com

China Mirrors: https://www.tbxark.cn

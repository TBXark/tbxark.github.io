import { argv, cd, fs } from "zx";
import "zx/globals";

cd(argv.d || ".")

let indexHTML = fs.readFileSync("index.html", "utf8");

//./src/home.css
const cssUpdateTime = fs.statSync("./src/home.css").mtimeMs / 1000;

// ./src/terminal.js
const jsUpdateTime = fs.statSync("./src/ternimal.js").mtimeMs / 1000;

// <link href="./src/home.css?ts=__STYLE_TIME_STAMP__" rel="stylesheet" />
// <script src="./sr/ternimal.js?ts=__SCRIPT_TIME_STAMP__" defer ></script>

indexHTML = indexHTML.replace(/__STYLE_TIME_STAMP__/g, parseInt(cssUpdateTime));
indexHTML = indexHTML.replace(/__SCRIPT_TIME_STAMP__/g, parseInt(jsUpdateTime));

fs.writeFileSync("index.html", indexHTML);
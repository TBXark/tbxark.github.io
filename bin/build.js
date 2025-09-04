import fs from 'fs';
import { fetchFileSHA } from './utils.js';

const styleSHA = await fetchFileSHA('src/home.css');
const scriptSHA = await fetchFileSHA('src/terminal.js');
const dataSHA = await fetchFileSHA('src/data.js');

let indexHTML = fs.readFileSync('index.html', 'utf8');

indexHTML = indexHTML.replace(
  /(src\/home\.css\?sha=)(__STYLE_SHA__|[a-f0-9]{7})/g,
  `$1${styleSHA}`
);

indexHTML = indexHTML.replace(
  /(src\/terminal\.js\?sha=)(__SCRIPT_SHA__|[a-f0-9]{7})/g,
  `$1${scriptSHA}`
);

indexHTML = indexHTML.replace(
  /(src\/data\.js\?sha=)(__DATA_SHA__|[a-f0-9]{7})/g,
  `$1${dataSHA}`
);

fs.writeFileSync('index.html', indexHTML);

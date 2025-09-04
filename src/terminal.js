const historyList = [];
const commandsHandler = {};
const remoteDataCache = {
  exe: window.exe || [],
  blogs: window.blogs || [],
  projects: window.projects || [],
};
let currentHistoryIndex = 0;

const cmdInput = document.getElementById('cmd-input');
const cmdHistory = document.getElementById('cmd-history');
const screenContainer = document.getElementById('screen-container');

const template = {
  cmdWithUser: (text, cmdClass) => {
    return `
    <div class="cmd-text">
      <span class="user">guest@tbxark:~$</span>
      <span class="${cmdClass || 'input-exe'}" style="display: inline">${text}</span>
    </div>`;
  },
  cmdText: (text) => {
    return `<div class="cmd-text">${text}</div>`;
  },
  blog: (b) => {
    const blogHost = 'https://github.com/TBXark/tbxark.github.io/blob/master/blog';
    return `
    <div class="cmd-text">
      <span class="full-mode">rw-r--r-- Tbxark </span>${b.date.split(' ')[0]} 
      <a class="file link" href="${blogHost}/${b.fileName}">
        <span>${b.title}</span>
      </a>
    </div>`;
  },
  project: (p) => {
    return `
    <div class="cmd-text project-line">
      <span class="terminal-prompt">├──</span>
      <a class="file link" href="${p.link}" target="_blank">
        <span>${p.name}</span>
      </a>
      <span class="project-desc"> - ${p.description}</span>
    </div>`;
  },
  exe: (e) => {
    if (e.type === 'link') {
      return `<a class="exe link" href="${e.url}">${e.name}</a>`;
    } else {
      return `<a class="exe" onclick="return handleCommand('${e.name}')">${e.name}</a>`;
    }
  },
};


function encodeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function startInput() {
  cmdInput.focus();
}

function addCmdResult(html) {
  cmdHistory.innerHTML += html;
  screenContainer.scrollTop = screenContainer.scrollHeight;
}

function handleShowHistory(isNext) {
  if (historyList.length === 0) {
    return;
  }
  currentHistoryIndex = (historyList.length + (isNext ? 1 : -1) + currentHistoryIndex) % historyList.length;
  cmdInput.value = historyList[currentHistoryIndex];
  cmdInput.selectionEnd = cmdInput.value.length;
}

function handleCommand(cmd) {
  const cmdClass = commandsHandler[cmd] === undefined ? 'input-exe-error' : 'input-exe';
  addCmdResult(template.cmdWithUser(cmd, cmdClass));
  if (cmd === undefined || cmd === null || cmd.trim().length === 0) {
    return;
  }
  historyList.push(cmd);
  currentHistoryIndex = 0;
  if (commandsHandler[cmd] !== undefined) {
    commandsHandler[cmd]();
  } else {
    addCmdResult(template.cmdText(`command not found: ${encodeHTML(cmd)}`));
  }
}

function handleAutoComplete() {
  const argv = cmdInput.value;
  for (const c of Object.keys(commandsHandler)) {
    if (c.startsWith(argv)) {
      cmdInput.value = c;
      break;
    }
  }
}

function handleInput(e) {
  switch (e.keyCode) {
    case 38:
    case 40: {
      handleShowHistory(e.keyCode === 40);
      checkInputStatus(cmdInput.value);
      break;
    }
    case 9: {
      e.preventDefault();
      handleAutoComplete();
      checkInputStatus(cmdInput.value);
      break;
    }
    case 13: {
      const argv = cmdInput.value;
      cmdInput.value = '';
      handleCommand(argv);
      break;
    }
  }
}

function checkInputStatus(value) {
  if (commandsHandler[value || cmdInput.value] !== undefined) {
    cmdInput.classList.remove('input-exe-error');
    cmdInput.classList.add('input-exe');
  } else {
    cmdInput.classList.remove('input-exe');
    cmdInput.classList.add('input-exe-error');
  }
}

function bindCommand() {
  commandsHandler.clear = () => {
    cmdHistory.innerHTML = '';
  };

  commandsHandler.pwd = () => {
    addCmdResult(template.cmdText(window.location.hostname));
  };


  commandsHandler.help = () => {
    const space = '&nbsp;&nbsp;&nbsp;&nbsp;';
    addCmdResult(template.cmdText('Welcome to tbxark\'s blog!'));
    addCmdResult(template.cmdText('Usage:'));
    addCmdResult(template.cmdText(`${space}<strong>ls</strong> - list all commands`));
    addCmdResult(template.cmdText(`${space}<strong>pwd</strong> - show current location`));
    addCmdResult(template.cmdText(`${space}<strong>clear</strong> - clear screen`));
    addCmdResult(template.cmdText(`${space}<strong>blogs</strong> - list all blogs`));
    addCmdResult(template.cmdText(`${space}<strong>projects</strong> - list all projects`));
    addCmdResult(template.cmdText(`${space}<strong>help</strong> - show help`));

  };

  commandsHandler.ls = () => {
    const exe = remoteDataCache.exe || [];
    addCmdResult(template.cmdText(exe.map(template.exe).join('\n')));
  };


  commandsHandler.blogs = () => {
    const blogs = remoteDataCache.blogs || [];
    addCmdResult(blogs.map(template.blog).join('\n'));
  };

  commandsHandler.projects = () => {
    const projects = remoteDataCache.projects || [];
    addCmdResult(projects.map(template.project).join('\n'));
  };

  console.log('This website is open source, you can find it on github: https://github.com/TBXark/tbxark.github.io');
}

function initTerminal() {
  if (document.location.host.indexOf('.cn') > 0) {
    document.getElementById('beian').style.display = 'block';
  }
  bindCommand()
  screenContainer.onclick = () => startInput();
  cmdInput.onkeydown = (e) => handleInput(e);
  cmdInput.oninput = (e) => checkInputStatus(e.target.value);
}

function main() {
    initTerminal();  
    for (const l of (window.exe || []).filter((e) => e.type === 'link')) {
      commandsHandler[l.name] = () => {
        window.location = l.url;
      };
    }
    handleCommand('ls');
    handleCommand('blogs');
}


main();
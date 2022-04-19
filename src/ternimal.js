const historyList = [];
const commandsHandler = {};
let currentHistoryIndex = 0;

const cmdInput = document.getElementById("cmd-input");
const cmdHistory = document.getElementById("cmd-history");
const screenContainer = document.getElementById("screen-container");

const template = {
    cmdWithUser: (text, cmdClass) => {
        return `<div class="cmd-text"><span class="user">guest@tbxark:~$</span> <span class="${cmdClass || "input-exe"}" style="display: inline">${text}</span></div>`;
    },
    cmdText: (text) => {
        return `<div class="cmd-text">${text}</div>`;
    },
    blog: (b) => {
        return `<div class="cmd-text"> <span class="full-mode">rw-r--r-- Tbxark </span>${b.date.split(" ")[0]} <a class="file link" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/${b.fileName}"><span>${b.title}</span></a></div>`;
    },
    project: (p) => {
        return `<div class="cmd-text"> <a class="file link" href="${p.link}"><span>${p.name}</span></a><span class="full-mode">: ${p.description}</span></div>`;
    },
    exe: (e) => {
        if (e.type === "link") {
            return `<a class="exe link" href="${e.url}">${e.name}</a>`;
        } else {
            return `<a class="exe" onclick="return handleCommand('${e.name}')">${e.name}</a>`;
        }
    }
}


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
    if (historyList.length == 0) {
        return;
    }
    currentHistoryIndex = (historyList.length + (isNext ? 1 : -1) + currentHistoryIndex) % historyList.length;
    cmdInput.value = historyList[currentHistoryIndex];
    cmdInput.selectionEnd = cmdInput.value.length;
}

function handleCommand(cmd) {
    const cmdClass = commandsHandler[cmd] === undefined ? "input-exe-error" : "input-exe"
    addCmdResult(template.cmdWithUser(cmd, cmdClass));
    if (cmd === undefined || cmd === null || cmd.trim().length == 0) {
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
            handleShowHistory(e.keyCode == 40);
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
            cmdInput.value = "";
            handleCommand(argv);
            break;
        }
    }
}

function checkInputStatus(value) {
    if (commandsHandler[value || cmdInput.value] !== undefined) {
        cmdInput.classList.remove("input-exe-error");
        cmdInput.classList.add("input-exe");
    } else {
        cmdInput.classList.remove("input-exe");
        cmdInput.classList.add("input-exe-error");
    }
}

async function loadResource() {
    commandsHandler.clear = () => {
        cmdHistory.innerHTML = "";
    };

    commandsHandler.pwd = () => {
        addCmdResult(template.cmdText(window.location.hostname));
    }

    const exe = await fetch("./api/exe.json").then((res) => res.json());
    commandsHandler.ls = () => {
        addCmdResult(template.cmdText(exe.map(template.exe).join("\n")));
    };

    for (const l of exe.filter((e) => e.type === "link")) {
        commandsHandler[l.name] = () => {
            window.location = l.url;
        };
    }
    handleCommand("ls");

    const blogs = await fetch("./api/blogs.json").then((res) => res.json());
    commandsHandler.blogs = () => {
        addCmdResult(blogs.map(template.blog).join("\n"));
    };
    handleCommand("blogs");

    const projects = await fetch("./api/projects.json").then((res) => res.json());
    commandsHandler.projects = () => {
        addCmdResult(projects.map(template.project).join("\n"));
    }; 
}


if (document.location.host.indexOf(".cn") > 0) {
    document.getElementById("beian").style.display = "block";
}
screenContainer.onclick = () => startInput();
cmdInput.onkeydown = (e) => handleInput(e);
cmdInput.oninput = (e) => checkInputStatus(e.target.value);
(async () => {
    await loadResource()
})()

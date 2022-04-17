const historyList = [];
const commandsHandler = {};
let currentHistoryIndex = 0;

const cmdInput = document.getElementById("cmd-input");
const cmdHistory = document.getElementById("cmd-history");
const screenContainer = document.getElementById("screen-container");

const template = {
    cmdWithUser: (text, cmdClass) => {
        return `<p class="cmd-text"><a class="user">guest@tbxark:~$</a> <a class="${cmdClass || "input-exe"}">${text}</a></p>`;
    },
    cmdText: (text) => {
        return `<p class="cmd-text">${text}</p>`;
    },
    blog: (b) => {
        return `<p class="cmd-text"> rw-r--r-- Tbxark ${b.date}  <a class="file link" href="https://github.com/TBXark/tbxark.github.io/blob/master/blog/${b.fileName}"><strong>${b.title}</strong></a></p>`;
    },
    project: (p) => {
        return `<p class="cmd-text"> <a class="file link" href="${p.link}"><strong>${p.name}</strong></a>: ${p.description}</p>`;
    }
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
    if (cmd === undefined || cmd === null || cmd.trim().length == 0) {
        return;
    }
    const cmdClass = commandsHandler[cmd] === undefined ? "input-exe-error" : "input-exe"
    addCmdResult(template.cmdWithUser(cmd, cmdClass));
    historyList.push(cmd);
    currentHistoryIndex = 0;
    if (commandsHandler[cmd] !== undefined) {
        commandsHandler[cmd]();
    } else {
        addCmdResult(template.cmdText(`command not found: ${cmd}`));
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
        addCmdResult(template.cmdWithUser(window.location.hostname));
    }

    const exe = await fetch("./database/exe.json").then((res) => res.json());
    commandsHandler.ls = () => {
        const html = exe
            .map((e) => {
                if (e.type === "link") {
                    return `<a class="exe link" href="${e.url}">${e.name}</a>`;
                } else {
                    return `<a class="exe" onclick="return handleCommand('${e.name}')">${e.name}</a>`;
                }
            })
            .join("\n");
        addCmdResult(template.cmdText(html));
    };
    for (const l of exe.filter((e) => e.type === "link")) {
        commandsHandler[l.name] = () => {
            window.location = l.url;
        };
    }
    handleCommand("ls");

    const blogs = await fetch("./database/blogs.json").then((res) => res.json());
    commandsHandler.blogs = () => {
        const html = blogs
            .map((b) => template.blog(b))
            .join("\n");
        addCmdResult(html);
    };
    handleCommand("blogs");

    const projects = await fetch("./database/projects.json").then((res) => res.json());
    commandsHandler.projects = () => {
        const html = projects
            .map((p) => template.project(p))
            .join("\n");
        addCmdResult(html);
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
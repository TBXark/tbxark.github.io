const historyList = [];
const commandsHandler = {};
let currentHistoryIndex = -1;

function startInput() {
    document.getElementById("cmd-input").focus();
}

function addCmdResult(html) {
    const origin = document.getElementById("cmd-history").innerHTML;
    document.getElementById("cmd-history").innerHTML = origin + html;
    const screen = document.getElementById("screen-container");
    screen.scrollTop = screen.scrollHeight;
}

function handleShowHistory(isNext) {
    const index =
        currentHistoryIndex < 0 && !isNext
            ? 0
            : currentHistoryIndex + (isNext ? -1 : 1);

    if (index < 0 || historyList.length == 0 || index >= historyList.length) {
        return;
    }

    const value = historyList[historyList.length - index - 1];
    currentHistoryIndex = index;
    const inputbar = document.getElementById("cmd-input");
    inputbar.value = value;
    inputbar.selectionEnd = value.length;
}

function handleCommand(cmd) {
    addCmdResult('<p class="cmd-text">guest@tbxark:~$ ' + cmd + "</p>");
    historyList.push(cmd);
    currentHistoryIndex = -1;
    if (cmd === undefined || cmd === null || cmd.trim().length == 0) {
        addCmdResult(html);
        return;
    }
    if (commandsHandler[cmd] !== undefined) {
        commandsHandler[cmd]();
    } else {
        addCmdResult('<p class="cmd-text">ERROR: unknown command</p>');
    }
}

function handleAutoComplete() {
    const inputbar = document.getElementById("cmd-input");
    const argv = inputbar.value;

    for (const c of Object.keys(commandsHandler)) {
        if (c.startsWith(argv)) {
            inputbar.value = c;
            break;
        }
    }
}

function handleInput(e) {
    if (e.keyCode == 13) {
        const inputbar = document.getElementById("cmd-input");
        const argv = inputbar.value;
        inputbar.value = "";
        handleCommand(argv);
    } else if (e.keyCode == 9) {
        e.preventDefault();
        handleAutoComplete();
    } else if (e.keyCode == 38 || e.keyCode == 40) {
        handleShowHistory(e.keyCode == 40);
    }
}

async function loadResource() {
    commandsHandler.clear = () => {
        const target = document.getElementById("cmd-history");
        target.innerHTML = "";
    };

    const exe = await fetch("./terminal/exe.json").then((res) => res.json());
    commandsHandler.ls = () => {
        const html = `<p class="cmd-text">${exe
            .map((e) => {
                if (e.type === "link") {
                    return `<a class="exe" href="${e.url}">${e.name}</a>`;
                } else {
                    return `<a class="exe" onclick="return handleCommand('${e.name}')">${e.name}</a>`;
                }
            })
            .join("\n")}</p>`;
        addCmdResult(html);
    };
    for (const l of exe.filter((e) => e.type === "link")) {
        commandsHandler[l.name] = () => {
            window.location = l.url;
        };
    }
    handleCommand("ls");


    const blogs = await fetch("./terminal/blogs.json").then((res) => res.json());

    commandsHandler.blogs = () => {
        const html = blogs
            .map((b) => {
                return `<p class="cmd-text"> rw-r--r-- 1 Tbxark staff  ${b.date}  <a class="file" href="${b.fileName}"><strong>${b.title}</strong></a></p>`;
            })
            .join("\n");
        addCmdResult(html);
    };
    handleCommand("blogs");

    const projects = await fetch("./terminal/projects.json").then((res) =>
        res.json()
    );
    commandsHandler.projects = () => {
        const html = projects
            .map((p) => {
                return `<p class="cmd-text"> ${p.link} -> <a class="file" href="${p.link}"><strong>${p.name}</strong></a></p>`;
            })
            .join("\n");
        addCmdResult(html);
    };

}

(async () => {
    await loadResource()
})()

const pty = require("node-pty");
const os = require("os");
const state = require("./state");
const config = require("./config");
const terminal = require("./terminal");

function spawnShell(options) {
  if (state.ptyProcess) return;

  state.startTime = Date.now();

  const { cols, rows } = terminal.termSize();

  state.ptyProcess = pty.spawn(config.shell, [], {
    name: "xterm-256color",
    cols: Math.max(cols - 0, 80),
    rows: Math.max(rows - terminal.HEADER_LINES - 2, 10),
    cwd: os.homedir(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
    },
  });

  terminal.log("ok", `spawned ${config.shell} (${state.ptyProcess.cols}x${state.ptyProcess.rows})`, options);

  state.ptyProcess.onData((data) => {
    terminal.log("debug", `pty → socket: ${data.length} bytes`, options);

    if (state.socket) {
      state.socket.emit("terminal-data", { sessionId: config.sessionId, data });
    }

    if (options && options.tail) {
      const c = terminal.c
      process.stdout.write(`${c.gray}${data}${c.reset}`);
    }
  });

  state.ptyProcess.onExit(({ exitCode }) => {
    terminal.log("warn", `shell exited (code ${exitCode})`, options);
    state.ptyProcess = null;
  });
}

module.exports = {
  spawnShell,
};

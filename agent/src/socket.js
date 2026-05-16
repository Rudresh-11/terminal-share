const io = require("socket.io-client");
const state = require("./state");
const config = require("./config");
const terminal = require("./terminal");
const pty = require("./pty");

function connect(options) {
  state.socket = io(config.RELAY_URL, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  terminal.log("info", `connecting → ${config.RELAY_URL}`, options);

  state.socket.on("connect", () => {
    state.connected = true;
    state.reconnectAttempts = 0;
    terminal.renderHeader(options);

    state.socket.emit("register-session", config.sessionId);

    terminal.log("ok", `relay connected (id: ${state.socket.id})`, options);
    terminal.log("debug", `socket transport: ${state.socket.io.engine.transport.name}`, options);
  });

  state.socket.on("disconnect", (reason) => {
    state.connected = false;
    terminal.renderHeader(options);
    terminal.log("warn", `relay disconnected — ${reason}`, options);
  });

  state.socket.io.on("reconnect_attempt", (n) => {
    state.reconnectAttempts = n;
    terminal.renderHeader(options);
    terminal.log("warn", `reconnect attempt #${n}`, options);
  });

  state.socket.io.on("reconnect", (n) => {
    terminal.log("ok", `reconnected after ${n} attempt(s)`, options);
  });

  state.socket.on("connect_error", (err) => {
    terminal.renderHeader(options);
    terminal.log("err", err.message, options);
    terminal.log("debug", err.stack?.split("\n")[1]?.trim() ?? "", options);
  });

  state.socket.on("user-connected", ({ viewers: count }) => {
    state.viewers = count + 1;
    terminal.renderHeader(options);
    terminal.log("ok", `viewer connected (total: ${state.viewers})`, options);
    pty.spawnShell(options);
  });

  state.socket.on("viewer-disconnected", ({ viewers: count }) => {
    state.viewers = count;
    terminal.renderHeader(options);
    terminal.log("warn", `viewer disconnected (remaining: ${state.viewers})`, options);
  });

  state.socket.on("terminal-input", (data) => {
    terminal.log("debug", `input ← socket: ${JSON.stringify(data).slice(0, 40)}`, options);
    if (state.ptyProcess) {
      state.ptyProcess.write(data);
    }
  });

  state.socket.on("resize", ({ cols, rows }) => {
    if (!state.ptyProcess) return;
    state.ptyProcess.resize(cols, rows);
    terminal.log("info", `resize → ${cols}×${rows}`, options);
  });

  state.socket.on("force-stop", () => {
    terminal.log("warn", "remote stop requested", options);
    // Need a way to call shutdown. I'll emit an event or just import index if I'm careful.
    // Better to use a callback or a state flag.
    state.remoteStopRequested = true;
  });

  if (options && options.debug) {
    state.socket.onAny((event, ...args) => {
      terminal.log("debug", `socket event ← "${event}" ${JSON.stringify(args).slice(0, 60)}`, options);
    });
  }
}

module.exports = {
  connect,
};

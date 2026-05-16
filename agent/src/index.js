const dotenv = require("dotenv");
dotenv.config();

const state = require("./state");

const config = require("./config");
const terminal = require("./terminal");
const pty = require("./pty");
const socket = require("./socket");
const cli = require("./cli");

function shutdown() {
  if (state.shuttingDown) return;
  state.shuttingDown = true;

  terminal.log("warn", "shutting down…", {});

  if (state.ptyProcess) state.ptyProcess.kill();

  if (state.socket) {
    state.socket.emit("agent-disconnected", config.sessionId);
    state.socket.disconnect();
  }

  setTimeout(() => {
    terminal.log("info", "bye", {});
    setTimeout(() => process.exit(0), 100);
  }, 300);
}

function main() {
  const options = cli.setupCLI();

  // Override relay URL if provided in options
  if (options.relay) {
    config.RELAY_URL = options.relay;
  }

  terminal.initialRender();
  socket.connect(options);

  setInterval(() => {
    terminal.renderHeader(options);
  }, 1000);

  process.stdout.on("resize", () => {
    terminal.renderHeader(options);
    terminal.log("debug", `terminal resized to ${terminal.termSize().cols}×${terminal.termSize().rows}`, options);
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Poll for remote stop request
  setInterval(() => {
    if (state.remoteStopRequested) {
      shutdown();
    }
  }, 500);
}

module.exports = {
  main,
};

const os = require("os");
const ansiEscapes = require("ansi-escapes");
const state = require("./state");
const config = require("./config");

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  white: "\x1b[97m",
};

const HEADER_LINES = 7;
const MAX_LOG = 200;

const levelColor = {
  info:  `${c.cyan}info${c.reset} `,
  ok:    `${c.green}ok  ${c.reset} `,
  warn:  `${c.yellow}warn${c.reset} `,
  err:   `${c.red}err ${c.reset} `,
  debug: `${c.blue}dbg ${c.reset} `,
};

function uptime() {
  if (!state.startTime) return "00:00";
  const sec = Math.floor((Date.now() - state.startTime) / 1000);
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function termSize() {
  return {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

function moveTo(row, col = 0) {
  process.stdout.write(`\x1b[${row};${col + 1}H`);
}

function saveCursor() {
  process.stdout.write("\x1b7");
}

function restoreCursor() {
  process.stdout.write("\x1b8");
}

function clearLine() {
  process.stdout.write("\x1b[2K");
}

function write(text) {
  process.stdout.write(text);
}

function hr() {
  const { cols } = termSize();
  return `${c.gray}${"─".repeat(Math.min(cols - 1, 60))}${c.reset}`;
}

function log(type, msg, options) {
  if (type === "debug" && (!options || !options.debug)) return;

  const ts = new Date().toTimeString().slice(0, 8);
  state.logBuffer.push({ ts, type, msg });

  if (state.logBuffer.length > MAX_LOG) state.logBuffer.shift();

  appendLogLine(state.logBuffer[state.logBuffer.length - 1]);
}

function appendLogLine({ ts, type, msg }) {
  const { rows } = termSize();
  saveCursor();
  moveTo(rows, 0);
  write("\n");
  clearLine();
  write(`${c.gray}[${ts}]${c.reset} ${levelColor[type] || ""}${msg}`);
  restoreCursor();
}

function renderHeader(options) {
  const status = state.connected
    ? `${c.green}● LIVE${c.reset}  `
    : `${c.red}● OFFLINE${c.reset}`;

  saveCursor();

  const headerLines = [
    `${c.bold}${c.white}termirror${c.reset} ${c.gray}v1.0${c.reset}${(options && options.debug) ? `  ${c.blue}[debug]${c.reset}` : ""}`,
    ``,
    `${status}  ${c.cyan}${config.sessionId}${c.reset}  ${c.gray}${state.viewers} viewer(s)${c.reset}  ${c.gray}${uptime()}${c.reset}`,
    `${c.gray}${config.shell}${c.reset}  ${c.gray}${os.hostname()}${c.reset}`,
    hr(),
    `${c.dim}open ${config.frontendUrl}/session/${config.sessionId}${c.reset}`,
    hr(),
  ];

  for (let i = 0; i < headerLines.length; i++) {
    moveTo(i + 1, 0);
    clearLine();
    write(headerLines[i]);
  }

  restoreCursor();
}

function initialRender() {
  write(ansiEscapes.clearScreen);
  renderHeader({}); // Initial render might not have options yet, or we can pass them

  moveTo(HEADER_LINES + 1, 0);
}

module.exports = {
  c,
  log,
  renderHeader,
  initialRender,
  termSize,
  HEADER_LINES,
};

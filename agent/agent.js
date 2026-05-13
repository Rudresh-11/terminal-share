#!/usr/bin/env node

const os = require("os");
const pty = require("node-pty");
const io = require("socket.io-client");
const dotenv = require("dotenv");
const path = require("path");
const { program } = require("commander");

program.option("-t, --tail", "enable test mode").option("--debug", "enable debug logging");

program.parse();

const options = program.opts();

dotenv.config();
// dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
const siteUrl = process.env.SITE_URL || "https://terminal-share.onrender.com";

console.log(`Connecting to relay server at ${siteUrl}...`);

const socket = io(siteUrl);
const sessionId = Math.floor(100000 + Math.random() * 900000).toString();
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

let ptyProcess = null;
let startTime = null;
let timerInterval = null;

// ─── ANSI helpers ────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  // fg
  white: "\x1b[97m",
  gray: "\x1b[90m",
  green: "\x1b[92m",
  yellow: "\x1b[93m",
  cyan: "\x1b[96m",
  red: "\x1b[91m",
  black: "\x1b[30m",
  // bg
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
  bgGray: "\x1b[100m",
  bgBlack: "\x1b[40m",
};

const W = 58; // box width (inner)

function repeat(ch, n) {
  return ch.repeat(Math.max(0, n));
}
function pad(str, len) {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  return str + repeat(" ", Math.max(0, len - visible.length));
}
function center(str, len) {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  const total = Math.max(0, len - visible.length);
  const left = Math.floor(total / 2);
  const right = total - left;
  return repeat(" ", left) + str + repeat(" ", right);
}

// box chars
const B = { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║", ml: "╠", mr: "╣", lj: "├", rj: "┤", th: "─" };

function boxTop() {
  return `${c.gray}${B.tl}${repeat(B.h, W + 2)}${B.tr}${c.reset}`;
}
function boxBot() {
  return `${c.gray}${B.bl}${repeat(B.h, W + 2)}${B.br}${c.reset}`;
}
function boxDiv() {
  return `${c.gray}${B.ml}${repeat(B.h, W + 2)}${B.mr}${c.reset}`;
}
function boxThin() {
  return `${c.gray}${B.lj}${repeat(B.th, W + 2)}${B.rj}${c.reset}`;
}
function boxRow(content) {
  return `${c.gray}${B.v}${c.reset} ${pad(content, W)} ${c.gray}${B.v}${c.reset}`;
}
function boxEmpty() {
  return boxRow("");
}

function elapsed() {
  if (!startTime) return "00:00";
  const s = Math.floor((Date.now() - startTime) / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ─── STATUS LINE (redrawn in-place) ─────────────────────────────────────────
const STATUS_ROW = 8; // line number of the status row from top (1-indexed)

function moveTo(row, col) {
  process.stdout.write(`\x1b[${row};${col}H`);
}
function saveCursor() {
  process.stdout.write("\x1b[s");
}
function restoreCursor() {
  process.stdout.write("\x1b[u");
}
function clearLine() {
  process.stdout.write("\x1b[2K");
}

function redrawStatus(label, color, bg) {
  saveCursor();
  moveTo(STATUS_ROW, 1);
  clearLine();
  const badge = ` ${label} `;
  const timer = startTime ? `  ${c.dim}${c.gray}uptime ${elapsed()}${c.reset}` : "";
  const inner = `${bg}${color}${c.bold}${badge}${c.reset}${timer}`;
  process.stdout.write(boxRow(inner));
  restoreCursor();
}

// ─── INITIAL DRAW ────────────────────────────────────────────────────────────
function drawBanner() {
  process.stdout.write("\x1b[2J\x1b[H"); // clear screen

  const logo = [
    `${c.green}${c.bold} ████████╗███████╗██████╗ ███╗   ███╗${c.reset}`,
    `${c.green}${c.bold} ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║${c.reset}`,
    `${c.green}${c.bold}    ██║   █████╗  ██████╔╝██╔████╔██║${c.reset}`,
    `${c.green}${c.bold}    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║${c.reset}`,
    `${c.green}${c.bold}    ██║   ███████╗██║  ██║██║ ╚═╝ ██║${c.reset}`,
    `${c.green}${c.bold}    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝${c.reset}`,
  ];

  console.log(boxTop());
  console.log(boxEmpty());
  //   for (const line of logo) {
  //     console.log(boxRow(center(line, W)));
  //   }
  console.log(boxRow(center(`${c.dim}${c.gray}Secure Remote Terminal Mirroring${c.reset}`, W)));
  console.log(boxEmpty());
  console.log(boxDiv());
  console.log(boxEmpty());

  // Status row (STATUS_ROW = 14)
  console.log(
    boxRow(`${c.bgGray}${c.white}${c.bold} WAITING ${c.reset}  ${c.gray}${c.dim}pending connection...${c.reset}`),
  );

  console.log(boxEmpty());
  console.log(boxThin());
  console.log(boxEmpty());

  // Session info
  const codeDisplay = sessionId.split("").join(" ");
  console.log(boxRow(`  ${c.dim}${c.gray}SESSION CODE${c.reset}`));
  console.log(boxRow(`  ${c.yellow}${c.bold}  ${codeDisplay}  ${c.reset}`));
  console.log(boxEmpty());
  console.log(boxRow(`  ${c.dim}${c.gray}SHELL    ${c.reset}  ${c.cyan}${shell}${c.reset}`));
  console.log(boxRow(`  ${c.dim}${c.gray}HOST     ${c.reset}  ${c.white}${os.hostname()}${c.reset}`));
  console.log(boxRow(`  ${c.dim}${c.gray}USER     ${c.reset}  ${c.white}${os.userInfo().username}${c.reset}`));
  console.log(boxRow(`  ${c.dim}${c.gray}PLATFORM ${c.reset}  ${c.white}${os.platform()} ${os.release()}${c.reset}`));
  console.log(boxEmpty());
  console.log(boxThin());
  console.log(boxEmpty());
  console.log(boxRow(`  ${c.gray}Enter the code above on ${siteUrl} ${c.reset}`));
  console.log(boxRow(`  ${c.gray}to start mirroring. Press ${c.white}Ctrl+C${c.gray} to stop.${c.reset}`));
  console.log(boxEmpty());
  console.log(boxBot());
  console.log();
  // console.log(`${c.gray}${repeat("─", W + 4)}${c.reset}`);
  // console.log(`${c.dim}${c.gray} ● terminal output will appear below${c.reset}`);
  // console.log(`${c.gray}${repeat("─", W + 4)}${c.reset}`);
  console.log();
}

// ─── LOG helpers ─────────────────────────────────────────────────────────────
function log(icon, color, msg) {
  const ts = new Date().toTimeString().slice(0, 8);
  console.log(`${c.gray}[${ts}]${c.reset} ${color}${icon}${c.reset}  ${msg}`);
}

function logInfo(msg) {
  log("◆", c.cyan, msg);
}
function logSuccess(msg) {
  log("✔", c.green, msg);
}
function logWarn(msg) {
  log("◈", c.yellow, msg);
}
function logError(msg) {
  log("✖", c.red, msg);
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
drawBanner();
logInfo(`Connecting to relay server${c.gray}...${c.reset}`);

socket.emit("register-session", sessionId);

socket.on("connect", () => {
  logSuccess(`Relay connected ${c.gray}(${socket.id})${c.reset}`);
});

socket.on("connect_error", (err) => {
  logError(`Relay connection failed: ${c.gray}${err.message}${c.reset}`);
});

// ─── USER CONNECTS ───────────────────────────────────────────────────────────
socket.on("user-connected", ({ viewers }) => {
  if (ptyProcess) {
    logWarn(`${c.yellow}Viewer Joined.${c.reset} ` + `${c.dim}Current viewers: ${viewers + 1}${c.reset}`);
    return;
  }

  startTime = Date.now();
  redrawStatus("● LIVE", c.white, c.bgGreen);
  logSuccess(`${c.green}${c.bold}Web user connected.${c.reset} Spawning ${c.cyan}${shell}${c.reset}...`);

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: os.homedir(),
    env: process.env,
  });

  // Update uptime every second
  timerInterval = setInterval(() => {
    redrawStatus("● LIVE", c.white, c.bgGreen);
  }, 1000);

  ptyProcess.onData((data) => {
    if (options.tail) {
      process.stdout.write(c.dim + c.gray + data + c.reset);
    }
    socket.emit("terminal-data", { sessionId, data });
  });
});

// ─── INPUT / RESIZE ──────────────────────────────────────────────────────────
socket.on("terminal-input", (data) => {
  if (ptyProcess) ptyProcess.write(data);
});

socket.on("resize", ({ cols, rows }) => {
  if (ptyProcess) {
    ptyProcess.resize(cols, rows);
  }
});

// ─── DISCONNECT ──────────────────────────────────────────────────────────────
socket.on("disconnect", () => {
  redrawStatus("◌ OFFLINE", c.white, c.bgRed);
  logWarn("Disconnected from relay.");
});

socket.on("force-stop", () => {
  logWarn("Remote stop requested.");
  process.emit("SIGINT");
});

socket.on("viewer-disconnected", ({ viewers }) => {
  logWarn(`${c.yellow}Viewer Left.${c.reset} ` + `${c.dim}Current viewers: ${viewers}${c.reset}`);
});

// ─── EXIT ────────────────────────────────────────────────────────────────────
process.on("SIGINT", () => {
  console.log();
  redrawStatus("◌ STOPPED", c.black, c.bgGray);
  if (timerInterval) clearInterval(timerInterval);
  logWarn(`${c.yellow}Agent shutting down...${c.reset}`);
  socket.emit("agent-disconnected", sessionId);
  if (ptyProcess) ptyProcess.kill();
  socket.disconnect();
  setTimeout(() => {
    logError("Session ended.");
    console.log();
    process.exit(0);
  }, 300);
});

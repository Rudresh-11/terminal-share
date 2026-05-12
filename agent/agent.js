const os = require("os");
const pty = require("node-pty");
const io = require("socket.io-client");

const socket = io("https://terminal-share.onrender.com/");
const sessionId = Math.floor(100000 + Math.random() * 900000).toString();

// Detect shell
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

let ptyProcess = null;

socket.emit("register-session", sessionId);

console.log(`\x1b[32m==================================================\x1b[0m`);
console.log(`\x1b[1mAgent running. Your sharing code is: \x1b[33m${sessionId}\x1b[0m`);
console.log(`\x1b[32m==================================================\x1b[0m`);
console.log(`Live Mirroring Active. Press Ctrl+C to stop.\n`);
console.log(`--------------------------------------------------`);
console.log(`\x1b[90mWaiting for a web user to connect with the code above...\x1b[0m`);

// Only spawn the PTY when a user actually connects
socket.on("user-connected", () => {
  if (ptyProcess) return; // Avoid spawning multiple times

  console.log(`\n\x1b[32m[!] User connected. Starting terminal session...\x1b[0m\n`);

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: os.homedir(),
    env: process.env,
  });

  // Send shell output to BOTH the Web Server and the Local Host Console
  ptyProcess.onData((data) => {
    // 1. Print the exact terminal output to the host's screen
    process.stdout.write("\x1b[90m" + data + "\x1b[0m");
    // 2. Send the exact terminal output to the web user
    socket.emit("terminal-data", { sessionId, data });
  });
});

// Receive keystrokes from the Relay Server
socket.on("terminal-input", (data) => {
  if (ptyProcess) {
    ptyProcess.write(data);
  }
});

socket.on("resize", ({ cols, rows }) => {
  if (ptyProcess) {
    ptyProcess.resize(cols, rows);
  }
});

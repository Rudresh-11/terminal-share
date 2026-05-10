const os = require('os');
const pty = require('node-pty');
const io = require('socket.io-client');

const socket = io('http://192.168.1.6:3000');
const sessionId = 'my-secret-session'; // This would be dynamic in production

// Detect shell
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

socket.emit('join-session', sessionId);

console.log(`Agent running. Sharing session: ${sessionId}`);
console.log(`Live Mirroring Active. Press Ctrl+C to stop.\n`);
console.log(`--------------------------------------------------`);

// Send shell output to BOTH the Web Server and the Local Host Console
ptyProcess.onData((data) => {
    // 1. Print the exact terminal output to the host's screen
    process.stdout.write('\x1b[90m' + data + '\x1b[0m'); 
    // 2. Send the exact terminal output to the web user
    socket.emit('terminal-data', { sessionId, data });
});

// Receive keystrokes from the Relay Server
socket.on('terminal-input', (data) => {
    // We no longer manually print the keystroke here. 
    // We just feed it to the shell, and the shell will echo it back out 
    // through ptyProcess.onData automatically!
    ptyProcess.write(data);
});
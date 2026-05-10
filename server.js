const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const activeSessions = new Set(); // Store valid 6-digit session IDs

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

io.on('connection', (socket) => {
    console.log('Connection established:', socket.id);

    // Join a room based on a session ID
    socket.on('join-session', (sessionId) => {
        if (/^\d{6}$/.test(sessionId)) {
            activeSessions.add(sessionId);
            socket.join(sessionId);
            socket.emit('session-joined', { status: 'success' });

            // Notify all agents in the room that a user has connected
            socket.to(sessionId).emit('user-connected');
        } else {
            socket.emit('session-joined', { status: 'error', message: 'Invalid session code' });
        }
    });

    // Relay terminal output from Agent -> Web
    socket.on('terminal-data', ({ sessionId, data }) => {
        socket.to(sessionId).emit('terminal-output', data);
    });

    // Relay keystrokes from Web -> Agent
    socket.on('terminal-input', ({ sessionId, data }) => {
        socket.to(sessionId).emit('terminal-input', data);
    });
});

server.listen(3000, () => console.log('Relay Server: http://localhost:3000'));
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Remote Terminal Relay Server is running.");
});

app.get("/sessions", (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([sessionId, info]) => ({
    sessionId,
    viewers: info.viewers,
    createdAt: info.createdAt,
  }));
  res.json(sessions);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" , uptime: process.uptime() , activeSessions: activeSessions.size ,timestamp: new Date().toISOString()});
});

const activeSessions = new Map(); // Store valid 6-digit session IDs

io.on("connection", (socket) => {
  console.log("Connection established:", socket.id);

  // Agents use this to announce their session code
  socket.on("register-session", (sessionId) => {
    if (/^\d{6}$/.test(sessionId)) {
      activeSessions.set(sessionId, {
        agentSocketId: socket.id,
        createdAt: Date.now(),
        viewers: 0,
      });

      socket.join(sessionId);

      socket.sessionId = sessionId;
      socket.role = "agent";

      console.log(`Session registered: ${sessionId}`);
    }
  });

  // Users use this to join an existing session
  socket.on("join-session", (sessionId) => {
    if (activeSessions.has(sessionId)) {
      socket.join(sessionId);

      socket.sessionId = sessionId;
      socket.role = "viewer";

      socket.emit("session-joined", {
        status: "success",
      });

      socket.to(sessionId).emit("user-connected", {
        viewers: activeSessions.get(sessionId).viewers,
      });

      activeSessions.get(sessionId).viewers++;
      console.log(`Viewer joined session: ${sessionId}`);
      const viewers = activeSessions.get(sessionId).viewers;
      io.to(sessionId).emit("viewer-count", viewers);
    } else {
      socket.emit("session-joined", {
        status: "error",
        message: "Invalid or expired session code",
      });
    }
  });

  // Relay terminal output from Agent -> Web
  socket.on("terminal-data", ({ sessionId, data }) => {
    io.to(sessionId).emit("terminal-output", data);
  });

  // Relay keystrokes from Web -> Agent
  socket.on("terminal-input", ({ sessionId, data }) => {
    socket.to(sessionId).emit("terminal-input", data);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);

    // If agent disconnects -> destroy session
    if (socket.role === "agent" && socket.sessionId) {
      activeSessions.delete(socket.sessionId);

      console.log(`Session expired: ${socket.sessionId}`);

      // Notify viewers
      socket.to(socket.sessionId).emit("session-ended");
    }

    // Notify agent when viewer disconnects
    if (socket.role === "viewer" && socket.sessionId) {
      const session = activeSessions.get(socket.sessionId);

      if (session) {
        session.viewers = Math.max(0, session.viewers - 1);
        io.to(socket.sessionId).emit("viewer-count", session.viewers);
      }

      socket.to(socket.sessionId).emit("viewer-disconnected", {
        viewers: session?.viewers || 0,
      });
    }
  });

  socket.on("resize", ({ sessionId, cols, rows }) => {
    socket.to(sessionId).emit("resize", {
      cols,
      rows,
    });
  });

  socket.on("agent-disconnected", (sessionId) => {
    console.log(`Agent disconnected: ${sessionId}`);

    activeSessions.delete(sessionId);

    io.to(sessionId).emit("session-ended");
  });

  socket.on("stop-session", (sessionId) => {
    const session = activeSessions.get(sessionId);

    if (session) {
      io.to(session.agentSocketId).emit("force-stop");
    }
  });
});

server.listen(3001, () => console.log("Relay Server: http://localhost:3001"));

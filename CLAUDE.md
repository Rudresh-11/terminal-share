# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Termirror (terminal-share) is a minimal collaborative terminal sharing application that allows users to share their terminal sessions in real-time, with an optional AI assistant that translates natural language into shell commands.

### Architecture
The project follows a three-tier architecture:
- **Agent (`/agent`)**: A Node.js CLI tool (published as `@rudresh-11/termirror`, bin: `termirror`) that uses `node-pty` to capture a local terminal session and streams it to the relay server via Socket.io. Source lives in `/agent/src` (`cli.js`, `config.js`, `index.js`, `pty.js`, `socket.js`, `state.js`, `terminal.js`); `agent.js` is the entry point.
- **Backend (`/server/backend`)**: A Node.js relay server (Express + Socket.io, `server.js`) that manages 6-digit session codes and routes terminal data between the agent and viewers. It holds no terminal state itself — it just relays Socket.io events by session room.
- **Frontend (`/server/client`)**: A Next.js (App Router) application that renders the shared terminal using `xterm.js` and lets remote users view/interact with it, plus an AI panel that turns natural-language prompts into shell commands.

### Relay protocol (Socket.io events between agent, backend, and client)
- `register-session` (agent → server): agent announces its 6-digit session code, joins that room as `role: "agent"`.
- `join-session` (viewer → server): viewer joins a room; server replies with `session-joined` and broadcasts `viewer-count` / `user-connected`.
- `terminal-data` (agent → server → viewers, as `terminal-output`): raw PTY output.
- `terminal-input` (viewer → server → agent): keystrokes typed remotely.
- `resize` (either direction): terminal cols/rows changes.
- `stop-session` / `agent-disconnected` / socket `disconnect`: server tears down the session and emits `session-ended`; if the agent's socket disconnects, the session is deleted immediately (sessions are not persisted anywhere — losing the agent connection ends the session).

### AI assistant feature (frontend)
- `server/client/lib/ai-service.ts`: builds the system prompt and calls the configured provider to turn a natural-language request into a single shell command (JSON `{ response, command }`). Supports a mock mode (API keys prefixed `test-`) for local testing without real credentials.
- `server/client/lib/ai-models.ts`: lists selectable models per provider (Claude, OpenAI, etc.).
- `server/client/hooks/use-ai-config.ts`: persists the user's chosen `AIProvider`/model/key.
- `server/client/app/api/claude/route.ts`: server-side proxy route for Claude requests (keeps provider calls off the client where needed).
- Generated commands are sent back into the session over the same `terminal-input` Socket.io channel as manual keystrokes — there is no separate "AI execute" transport.

## Development Commands

### Agent
Run from the `/agent` directory:
- Start agent: `npm start`
- Start agent in debug mode: `npm run dev`

### Backend Server
Run from the `/server/backend` directory:
- Start server: `npm start`

### Frontend Client
Run from the `/server/client` directory:
- Development: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Format: `npm run format`

### Infrastructure
- Docker: Use `docker-compose up` from the `/server` directory to start both the backend and frontend.
- Vercel: `server/client` and `server/backend` each deploy as separate Vercel projects (set that directory as the project's Root Directory) and each carries its own `vercel.json`.
  - `server/client` is zero-config Next.js.
  - `server/backend` exports its `http.Server` from `api/index.js` (`server.js` skips `.listen()` when `process.env.VERCEL` is set) and relies on a catch-all rewrite to `/api/index` plus Fluid Compute so the Socket.io WebSocket upgrade and long-lived connections work. This requires Fluid Compute (default for new Vercel projects). Its `activeSessions` Map is in-memory per function instance — Vercel does not guarantee instance affinity across reconnects or multi-instance scaling, so under concurrent load or a redeploy, session/viewer state can fragment across instances. Accepted tradeoff for now; revisit with an external store (e.g. Redis) if this becomes a problem.

## Code Style and Patterns
- **Frontend**: Next.js App Router with Tailwind CSS and shadcn/ui.
- **Communication**: Real-time data transfer is handled by Socket.io.
- **Terminal Rendering**: `xterm.js` is used on the client for terminal emulation.
- **PTY Management**: `node-pty` is used in the agent for terminal process control.

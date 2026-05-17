# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Termirror (terminal-share) is a minimal collaborative terminal sharing application that allows users to share their terminal sessions in real-time.

### Architecture
The project follows a three-tier architecture:
- **Agent (`/agent`)**: A Node.js CLI tool that uses `node-pty` to capture a local terminal session and streams it to the relay server via Socket.io.
- **Backend (`/server/backend`)**: A Node.js relay server (Express + Socket.io) that manages connections and routes terminal data between the agent and the frontend client.
- **Frontend (`/server/client`)**: A Next.js application that renders the shared terminal using `xterm.js` and allows remote interaction.

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

## Code Style and Patterns
- **Frontend**: Next.js App Router with Tailwind CSS and shadcn/ui.
- **Communication**: Real-time data transfer is handled by Socket.io.
- **Terminal Rendering**: `xterm.js` is used on the client for terminal emulation.
- **PTY Management**: `node-pty` is used in the agent for terminal process control.

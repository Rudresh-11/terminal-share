// lib/socket.ts

import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:3001";

console.log("Socket URL:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
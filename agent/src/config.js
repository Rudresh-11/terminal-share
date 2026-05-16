const os = require("os");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("1234567890", 6);

module.exports = {
  RELAY_URL: process.env.SITE_URL || "https://terminal-share-backend.onrender.com",
  frontendUrl: "https://terminal-share-2.onrender.com",
  shell: os.platform() === "win32" ? "powershell.exe" : process.env.SHELL || "bash",
  sessionId: nanoid(),
};

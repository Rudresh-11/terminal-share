const { program } = require("commander");

function setupCLI() {
  program
    .name("termirror")
    .description("Minimal collaborative terminal sharing — share your terminal session with a URL")
    .version("1.0.0")
    .option("-t, --tail", "mirror terminal output locally in addition to broadcasting")
    .option("--debug", "enable verbose debug logs (socket events, resize, raw data info)")
    .option("--relay <url>", "override the default relay server URL (e.g. http://localhost:3001)")
    .addHelpText("after", `
Examples:
  $ termirror                          start a session with default relay
  $ termirror --tail                   start and mirror output locally
  $ termirror --relay http://localhost:3001   use a custom relay server
  $ termirror --debug                  start with verbose debug logging
  $ termirror --debug --tail           full debug + local mirror

Environment variables:
  SITE_URL      relay server URL (overridden by --relay)
  SHELL         shell to spawn (default: bash)

How it works:
  1. Run termirror — a 6-digit session ID is generated
  2. Share the viewer URL shown on screen
  3. Viewers open the URL in their browser to watch live
  4. Viewers can optionally send input if the server allows it
  5. Press Ctrl+C to end the session
`);

  program.parse();
  program.showHelpAfterError();
  return program.opts();
}

module.exports = {
  setupCLI,
};

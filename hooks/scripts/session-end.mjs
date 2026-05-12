// src/lib/stdin.ts
var STDIN_TIMEOUT_MS = 5e3;
async function readStdin(timeoutMs = STDIN_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve("{}");
    }, timeoutMs);
    const chunks = [];
    process.stdin.on("data", (chunk) => {
      chunks.push(chunk);
    });
    process.stdin.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
    process.stdin.on("error", () => {
      clearTimeout(timer);
      resolve("{}");
    });
    if (process.stdin.isTTY) {
      clearTimeout(timer);
      resolve("{}");
    }
  });
}
async function parseStdinJson(timeoutMs) {
  const raw = await readStdin(timeoutMs);
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function writeOutput(output) {
  process.stdout.write(JSON.stringify(output) + "\n");
}

// src/lib/state.ts
import { join as join2 } from "path";
import { existsSync as existsSync2, unlinkSync, readdirSync } from "fs";

// src/lib/paths.ts
import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
var __dirname_resolved = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
function getOmqHome() {
  return join(homedir(), ".qoder", "omq");
}
function getStateDir(sessionId) {
  const base = join(getOmqHome(), "state");
  return sessionId ? join(base, sessionId) : base;
}

// src/lib/atomic-write.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname as dirname2 } from "path";

// src/lib/state.ts
var STALE_THRESHOLD_MS = 2 * 60 * 60 * 1e3;
function getActiveModes(sessionId) {
  const dir = getStateDir(sessionId);
  if (!existsSync2(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith("-state.json"));
  return files.map((f) => f.replace("-state.json", ""));
}

// src/hooks/session-end.ts
async function main() {
  const input = await parseStdinJson();
  const sessionId = input.session_id || "unknown";
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const activeModes = getActiveModes(sessionId);
  if (activeModes.length > 0) {
  }
  writeOutput({ continue: true });
}
main().catch(() => {
  writeOutput({ continue: true });
});

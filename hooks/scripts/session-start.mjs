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
function readJsonSafe(filePath, fallback) {
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// src/lib/state.ts
var STALE_THRESHOLD_MS = 2 * 60 * 60 * 1e3;
function getModeStatePath(sessionId, mode) {
  return join2(getStateDir(sessionId), `${mode}-state.json`);
}
function readModeState(sessionId, mode) {
  const path = getModeStatePath(sessionId, mode);
  const state = readJsonSafe(path, null);
  if (!state) return null;
  const elapsed = Date.now() - new Date(state.startedAt).getTime();
  if (elapsed > STALE_THRESHOLD_MS) {
    clearModeState(sessionId, mode);
    return null;
  }
  return state;
}
function clearModeState(sessionId, mode) {
  const path = getModeStatePath(sessionId, mode);
  if (existsSync2(path)) {
    unlinkSync(path);
  }
}
function getActiveModes(sessionId) {
  const dir = getStateDir(sessionId);
  if (!existsSync2(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith("-state.json"));
  return files.map((f) => f.replace("-state.json", ""));
}

// src/hooks/session-start.ts
async function main() {
  const input = await parseStdinJson();
  const sessionId = input.session_id || "unknown";
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const activeModes = getActiveModes(sessionId);
  if (activeModes.length === 0) {
    writeOutput({ continue: true });
    return;
  }
  const modeDescriptions = activeModes.map((mode) => {
    const state = readModeState(sessionId, mode);
    if (!state) return `- ${mode}: (stale, cleared)`;
    return `- **${mode}**: iteration ${state.iteration}/${state.maxIterations}`;
  });
  const message = [
    "\u{1F4CB} **oh-my-qoder: Active Modes Restored**",
    "",
    ...modeDescriptions,
    "",
    "Continuing from where we left off. Use `/cancel` to stop all modes."
  ].join("\n");
  writeOutput({
    continue: true,
    message
  });
}
main().catch(() => {
  writeOutput({ continue: true });
});

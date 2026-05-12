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

// src/lib/config.ts
import { existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";

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
function getProjectStateDir(cwd) {
  const dir = cwd || process.cwd();
  return join(dir, ".omq");
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

// src/lib/config.ts
var DEFAULT_CONFIG = {
  modes: {
    ralph: { enabled: true, maxIterations: 50, defaultCritic: "critic" },
    autopilot: { enabled: true, maxQaCycles: 5 },
    ultrawork: { enabled: true }
  },
  codeSimplifier: { enabled: true, extensions: [".ts", ".js", ".py", ".go", ".rs"], maxFiles: 10 },
  contextGuard: { enabled: true, threshold: 85 },
  projectMemory: { enabled: true },
  security: { hardMaxIterations: 200 }
};
function loadConfig(cwd) {
  const projectConfig = join2(getProjectStateDir(cwd), "omq.jsonc");
  if (existsSync2(projectConfig)) {
    const config = readJsonSafe(projectConfig, {});
    return { ...DEFAULT_CONFIG, ...config };
  }
  const userConfig = join2(getOmqHome(), "config.jsonc");
  if (existsSync2(userConfig)) {
    const config = readJsonSafe(userConfig, {});
    return { ...DEFAULT_CONFIG, ...config };
  }
  return DEFAULT_CONFIG;
}

// src/lib/state.ts
import { join as join3 } from "path";
import { existsSync as existsSync3, unlinkSync, readdirSync } from "fs";
var STALE_THRESHOLD_MS = 2 * 60 * 60 * 1e3;
function getActiveModes(sessionId) {
  const dir = getStateDir(sessionId);
  if (!existsSync3(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith("-state.json"));
  return files.map((f) => f.replace("-state.json", ""));
}

// src/hooks/code-simplifier.ts
async function main() {
  const input = await parseStdinJson();
  const sessionId = input.session_id || "unknown";
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const config = loadConfig(input.directory);
  if (!config.codeSimplifier.enabled) {
    writeOutput({ continue: true });
    return;
  }
  const activeModes = getActiveModes(sessionId);
  if (activeModes.length > 0) {
    writeOutput({ continue: true });
    return;
  }
  writeOutput({
    continue: true,
    message: [
      "\u{1F4A1} **Code Simplifier**: Review completed changes for:",
      "- Unnecessary abstractions or over-engineering",
      "- Dead code that can be removed",
      "- Complex conditionals that can be simplified",
      "- Functions that do too many things"
    ].join("\n")
  });
}
main().catch(() => {
  writeOutput({ continue: true });
});

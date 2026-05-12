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
function getProjectStateDir(cwd) {
  const dir = cwd || process.cwd();
  return join(dir, ".omq");
}

// src/lib/atomic-write.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname as dirname2 } from "path";
function atomicWriteJson(filePath, data) {
  const dir = dirname2(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const content = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(filePath, content, "utf-8");
}
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
function writeModeState(sessionId, state) {
  const path = getModeStatePath(sessionId, state.mode);
  atomicWriteJson(path, state);
}
function getActiveModes(sessionId) {
  const dir = getStateDir(sessionId);
  if (!existsSync2(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith("-state.json"));
  return files.map((f) => f.replace("-state.json", ""));
}

// src/lib/config.ts
import { existsSync as existsSync3 } from "fs";
import { join as join3 } from "path";
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
  const projectConfig = join3(getProjectStateDir(cwd), "omq.jsonc");
  if (existsSync3(projectConfig)) {
    const config = readJsonSafe(projectConfig, {});
    return { ...DEFAULT_CONFIG, ...config };
  }
  const userConfig = join3(getOmqHome(), "config.jsonc");
  if (existsSync3(userConfig)) {
    const config = readJsonSafe(userConfig, {});
    return { ...DEFAULT_CONFIG, ...config };
  }
  return DEFAULT_CONFIG;
}

// src/hooks/keyword-detector.ts
var KEYWORD_MAP = [
  { keyword: "ralph", mode: "ralph", aliases: ["don't stop", "dont stop", "keep going", "persistent", "never stop"] },
  { keyword: "autopilot", mode: "autopilot", aliases: ["auto", "build me", "autonomous", "full auto"] },
  { keyword: "ultrawork", mode: "ultrawork", aliases: ["ulw", "parallel", "burst"] },
  { keyword: "team", mode: "team", aliases: ["delegate", "multi-agent"] }
];
function detectKeyword(prompt) {
  const lower = prompt.toLowerCase().trim();
  for (const entry of KEYWORD_MAP) {
    if (lower.startsWith(entry.keyword) || lower.includes(`/${entry.keyword}`)) {
      return entry;
    }
    for (const alias of entry.aliases) {
      if (lower.includes(alias)) {
        return entry;
      }
    }
  }
  return null;
}
function buildActivationMessage(match, sessionId) {
  const messages = {
    ralph: `\u{1F504} **Ralph Mode Activated** \u2014 Persistent execution enabled. I will not stop until the task is fully complete. Use \`/cancel\` to stop.`,
    autopilot: `\u{1F680} **Autopilot Mode Activated** \u2014 Full autonomous pipeline engaged:
  Phase 0: Idea Expansion \u2192 Phase 1: Design \u2192 Phase 2: Implementation \u2192 Phase 3: QA \u2192 Phase 4: Validation
  Use \`/cancel\` to stop.`,
    ultrawork: `\u26A1 **Ultrawork Mode Activated** \u2014 Parallel burst execution. Multiple agents will work simultaneously on independent tasks.`,
    team: `\u{1F465} **Team Mode Activated** \u2014 Multi-agent delegation enabled. Tasks will be routed to specialized agents.`
  };
  return messages[match.mode];
}
function createInitialState(mode, sessionId, config) {
  const base = {
    mode,
    active: true,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    iteration: 0,
    maxIterations: config.security.hardMaxIterations,
    sessionId
  };
  switch (mode) {
    case "ralph":
      return {
        ...base,
        maxIterations: config.modes.ralph.maxIterations,
        prd: { title: "", stories: [] },
        progress: []
      };
    case "autopilot":
      return {
        ...base,
        phase: 0,
        phaseHistory: []
      };
    case "ultrawork":
      return {
        ...base,
        tasks: []
      };
    default:
      return base;
  }
}
async function main() {
  const input = await parseStdinJson();
  const prompt = input.prompt || "";
  const sessionId = input.session_id || "unknown";
  if (!prompt) {
    writeOutput({ continue: true });
    return;
  }
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const match = detectKeyword(prompt);
  if (!match) {
    writeOutput({ continue: true });
    return;
  }
  const config = loadConfig(input.directory);
  const modeConfig = config.modes[match.mode];
  if (modeConfig && "enabled" in modeConfig && !modeConfig.enabled) {
    writeOutput({ continue: true });
    return;
  }
  const activeModes = getActiveModes(sessionId);
  if (activeModes.includes(match.mode)) {
    writeOutput({
      continue: true,
      message: `\u26A0\uFE0F ${match.mode} mode is already active (iteration ${activeModes.length}). Continuing...`
    });
    return;
  }
  const state = createInitialState(match.mode, sessionId, config);
  writeModeState(sessionId, state);
  const message = buildActivationMessage(match, sessionId);
  writeOutput({
    continue: true,
    message
  });
}
main().catch(() => {
  writeOutput({ continue: true });
});

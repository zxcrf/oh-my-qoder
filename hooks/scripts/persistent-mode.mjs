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
function writeModeState(sessionId, state) {
  const path = getModeStatePath(sessionId, state.mode);
  atomicWriteJson(path, state);
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

// src/hooks/persistent-mode.ts
function buildContinuationMessage(state) {
  switch (state.mode) {
    case "ralph": {
      const rs = state;
      const remaining = rs.prd.stories.filter((s) => !s.passed);
      if (remaining.length === 0) return null;
      return [
        `\u{1F504} **Ralph: Continuing** (iteration ${rs.iteration + 1}/${rs.maxIterations})`,
        "",
        `Remaining stories: ${remaining.length}/${rs.prd.stories.length}`,
        remaining.map((s) => `- [ ] ${s.title}`).join("\n"),
        "",
        "Continue working on the remaining items. Do NOT stop until all acceptance criteria pass."
      ].join("\n");
    }
    case "autopilot": {
      const as = state;
      const phaseNames = ["Expansion", "Design", "Implementation", "QA", "Validation"];
      if (as.phase >= 4) return null;
      return [
        `\u{1F680} **Autopilot: Phase ${as.phase} (${phaseNames[as.phase]}) complete**`,
        "",
        `Advancing to Phase ${as.phase + 1}: ${phaseNames[as.phase + 1]}`,
        "",
        "Continue with the next phase. Do NOT stop until all phases are complete."
      ].join("\n");
    }
    default:
      return null;
  }
}
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
  const config = loadConfig(input.directory);
  for (const mode of activeModes) {
    const state = readModeState(sessionId, mode);
    if (!state || !state.active) continue;
    if (state.iteration >= state.maxIterations) {
      writeOutput({
        continue: true,
        message: `\u26A0\uFE0F **${mode}** reached max iterations (${state.maxIterations}). Stopping.`
      });
      state.active = false;
      writeModeState(sessionId, state);
      return;
    }
    const continuation = buildContinuationMessage(state);
    if (!continuation) {
      writeOutput({
        continue: true,
        message: `\u2705 **${mode}** mode complete! All objectives achieved.`
      });
      state.active = false;
      writeModeState(sessionId, state);
      return;
    }
    state.iteration++;
    writeModeState(sessionId, state);
    writeOutput({
      continue: true,
      userMessage: continuation
    });
    return;
  }
  writeOutput({ continue: true });
}
main().catch(() => {
  writeOutput({ continue: true });
});

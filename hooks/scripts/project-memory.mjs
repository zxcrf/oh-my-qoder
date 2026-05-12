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

// src/lib/paths.ts
import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
var __dirname_resolved = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
function getOmqHome() {
  return join(homedir(), ".qoder", "omq");
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

// src/lib/config.ts
import { existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";
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

// src/hooks/project-memory.ts
import { join as join3 } from "path";
function getMemoryPath(cwd) {
  return join3(getProjectStateDir(cwd), "project-memory.json");
}
function loadMemory(cwd) {
  return readJsonSafe(getMemoryPath(cwd), {
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    filePatterns: {},
    commonPaths: [],
    notes: [],
    directives: []
  });
}
function saveMemory(memory, cwd) {
  memory.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  atomicWriteJson(getMemoryPath(cwd), memory);
}
async function handlePostTool(input) {
  const config = loadConfig(input.directory);
  if (!config.projectMemory.enabled) {
    writeOutput({ continue: true });
    return;
  }
  const toolInput = input.tool_input;
  if (!toolInput) {
    writeOutput({ continue: true });
    return;
  }
  const memory = loadMemory(input.directory);
  const filePath = toolInput.file_path || toolInput.path || "";
  if (filePath) {
    const ext = filePath.split(".").pop() || "unknown";
    memory.filePatterns[ext] = (memory.filePatterns[ext] || 0) + 1;
    const parts = filePath.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const topDir = parts.slice(0, 2).join("/");
      if (!memory.commonPaths.includes(topDir)) {
        memory.commonPaths.push(topDir);
        if (memory.commonPaths.length > 20) {
          memory.commonPaths = memory.commonPaths.slice(-20);
        }
      }
    }
  }
  saveMemory(memory, input.directory);
  writeOutput({ continue: true });
}
async function handlePreCompact(input) {
  const config = loadConfig(input.directory);
  if (!config.projectMemory.enabled) {
    writeOutput({ continue: true });
    return;
  }
  const memory = loadMemory(input.directory);
  if (memory.notes.length > 0 || memory.directives.length > 0) {
    const context = [
      "\u{1F4DD} **Project Memory** (preserved across compaction):",
      "",
      ...memory.directives.map((d) => `- \u{1F4CC} ${d}`),
      ...memory.notes.slice(-5).map((n) => `- ${n}`),
      "",
      `Active file types: ${Object.entries(memory.filePatterns).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ext, count]) => `.${ext}(${count})`).join(", ")}`
    ].join("\n");
    writeOutput({
      continue: true,
      message: context
    });
    return;
  }
  writeOutput({ continue: true });
}
async function main() {
  const input = await parseStdinJson();
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const mode = process.argv[2];
  if (mode === "precompact") {
    await handlePreCompact(input);
  } else {
    await handlePostTool(input);
  }
}
main().catch(() => {
  writeOutput({ continue: true });
});

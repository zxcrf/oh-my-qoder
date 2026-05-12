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

// src/hooks/pre-tool-enforcer.ts
var AGENT_RESTRICTIONS = {
  architect: ["Write", "Edit", "Bash"],
  analyst: ["Write", "Edit", "Bash"],
  planner: ["Write", "Edit"],
  critic: ["Write", "Edit", "Bash"],
  "security-reviewer": ["Write", "Edit", "Bash"],
  "code-reviewer": ["Write", "Edit", "Bash"],
  designer: ["Bash"],
  "git-master": ["Write", "Edit"],
  explore: ["Write", "Edit", "Bash"],
  verifier: ["Write", "Edit"],
  tracer: ["Write", "Edit", "Bash"]
};
async function main() {
  const input = await parseStdinJson();
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const toolName = input.tool_name;
  if (!toolName) {
    writeOutput({ continue: true });
    return;
  }
  const agentName = process.env.OMQ_CURRENT_AGENT || input.agent_name;
  if (!agentName) {
    writeOutput({ continue: true });
    return;
  }
  const restrictions = AGENT_RESTRICTIONS[agentName];
  if (!restrictions || !restrictions.includes(toolName)) {
    writeOutput({ continue: true });
    return;
  }
  writeOutput({
    decision: "block",
    reason: `Agent "${agentName}" is not allowed to use the ${toolName} tool. This agent is read-only or has restricted capabilities. Delegate to an appropriate agent (e.g., executor, debugger) for write operations.`
  });
}
main().catch(() => {
  writeOutput({ continue: true });
});

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

// src/hooks/post-tool-verifier.ts
var SECURITY_PATTERNS = [
  /api[_-]?key\s*[=:]\s*['"][^'"]{8,}['"]/i,
  /password\s*[=:]\s*['"][^'"]{4,}['"]/i,
  /secret\s*[=:]\s*['"][^'"]{8,}['"]/i,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
  /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/
];
function checkSecurityIssues(output) {
  for (const pattern of SECURITY_PATTERNS) {
    if (pattern.test(output)) {
      return "Potential secret or credential detected in tool output. Review before committing.";
    }
  }
  return null;
}
async function main() {
  const input = await parseStdinJson();
  if (process.env.DISABLE_OMQ === "1") {
    writeOutput({ continue: true });
    return;
  }
  const toolOutput = input.tool_output || "";
  const toolName = input.tool_name || "";
  if (["Write", "Edit"].includes(toolName)) {
    const toolInput = input.tool_input;
    const content = toolInput?.content || toolInput?.new_string || "";
    const securityWarning = checkSecurityIssues(content);
    if (securityWarning) {
      writeOutput({
        continue: true,
        message: `\u26A0\uFE0F **Security Warning**: ${securityWarning}`
      });
      return;
    }
  }
  if (toolName === "Bash" && toolOutput.includes("command not found")) {
    writeOutput({
      continue: true,
      message: "\u26A0\uFE0F Command not found. Check that the tool/binary is installed and in PATH."
    });
    return;
  }
  writeOutput({ continue: true });
}
main().catch(() => {
  writeOutput({ continue: true });
});

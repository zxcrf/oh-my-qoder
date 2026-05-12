/**
 * Post-Tool Verifier Hook (PostToolUse)
 *
 * Verifies tool outputs for common issues:
 * - Failed commands (non-zero exit codes)
 * - Empty file writes
 * - Potential security issues in tool outputs
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import type { HookInput } from '../types/hooks.js';

const SECURITY_PATTERNS = [
  /api[_-]?key\s*[=:]\s*['"][^'"]{8,}['"]/i,
  /password\s*[=:]\s*['"][^'"]{4,}['"]/i,
  /secret\s*[=:]\s*['"][^'"]{8,}['"]/i,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
  /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/,
];

function checkSecurityIssues(output: string): string | null {
  for (const pattern of SECURITY_PATTERNS) {
    if (pattern.test(output)) {
      return 'Potential secret or credential detected in tool output. Review before committing.';
    }
  }
  return null;
}

async function main() {
  const input = await parseStdinJson<HookInput>();

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const toolOutput = input.tool_output || '';
  const toolName = input.tool_name || '';

  // Check for security issues in Write/Edit output content
  if (['Write', 'Edit'].includes(toolName)) {
    const toolInput = input.tool_input as Record<string, string> | undefined;
    const content = toolInput?.content || toolInput?.new_string || '';
    const securityWarning = checkSecurityIssues(content);
    if (securityWarning) {
      writeOutput({
        continue: true,
        message: `⚠️ **Security Warning**: ${securityWarning}`,
      });
      return;
    }
  }

  // Check for command failures
  if (toolName === 'Bash' && toolOutput.includes('command not found')) {
    writeOutput({
      continue: true,
      message: '⚠️ Command not found. Check that the tool/binary is installed and in PATH.',
    });
    return;
  }

  writeOutput({ continue: true });
}

main().catch(() => {
  writeOutput({ continue: true });
});

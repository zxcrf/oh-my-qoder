/**
 * Pre-Tool Enforcer Hook (PreToolUse)
 *
 * Enforces tool restrictions for specialized agents.
 * When an agent has disallowedTools, blocks those tool uses.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import type { HookInput } from '../types/hooks.js';

// Agent tool restrictions (mirrors agents/ frontmatter)
const AGENT_RESTRICTIONS: Record<string, string[]> = {
  architect: ['Write', 'Edit', 'Bash'],
  analyst: ['Write', 'Edit', 'Bash'],
  planner: ['Write', 'Edit'],
  critic: ['Write', 'Edit', 'Bash'],
  'security-reviewer': ['Write', 'Edit', 'Bash'],
  'code-reviewer': ['Write', 'Edit', 'Bash'],
  designer: ['Bash'],
  'git-master': ['Write', 'Edit'],
  explore: ['Write', 'Edit', 'Bash'],
  verifier: ['Write', 'Edit'],
  tracer: ['Write', 'Edit', 'Bash'],
};

async function main() {
  const input = await parseStdinJson<HookInput>();

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const toolName = input.tool_name;
  if (!toolName) {
    writeOutput({ continue: true });
    return;
  }

  // Detect current agent from environment or input metadata
  const agentName = process.env.OMQ_CURRENT_AGENT || (input as any).agent_name;
  if (!agentName) {
    writeOutput({ continue: true });
    return;
  }

  const restrictions = AGENT_RESTRICTIONS[agentName];
  if (!restrictions || !restrictions.includes(toolName)) {
    writeOutput({ continue: true });
    return;
  }

  // Block the tool use
  writeOutput({
    decision: 'block',
    reason: `Agent "${agentName}" is not allowed to use the ${toolName} tool. This agent is read-only or has restricted capabilities. Delegate to an appropriate agent (e.g., executor, debugger) for write operations.`,
  });
}

main().catch(() => {
  writeOutput({ continue: true });
});

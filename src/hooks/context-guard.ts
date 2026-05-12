/**
 * Context Guard Hook (Stop)
 *
 * Monitors context window usage and warns when approaching limits.
 * Suggests compaction or task splitting at configurable thresholds.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { loadConfig } from '../lib/config.js';
import type { HookInput } from '../types/hooks.js';

async function main() {
  const input = await parseStdinJson<HookInput>();

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const config = loadConfig(input.directory);
  if (!config.contextGuard.enabled) {
    writeOutput({ continue: true });
    return;
  }

  const contextUsage = input.context_usage;
  if (contextUsage === undefined || contextUsage === null) {
    writeOutput({ continue: true });
    return;
  }

  const threshold = config.contextGuard.threshold;

  if (contextUsage >= 95) {
    writeOutput({
      continue: true,
      message: [
        '🚨 **Context Window Critical** (${contextUsage}% used)',
        '',
        'Immediate actions required:',
        '1. Save all important state to TodoWrite or files',
        '2. Summarize current progress',
        '3. Context will be compacted imminently',
      ].join('\n').replace('${contextUsage}', String(contextUsage)),
    });
  } else if (contextUsage >= threshold) {
    writeOutput({
      continue: true,
      message: [
        `⚠️ **Context Window Warning** (${contextUsage}% used, threshold: ${threshold}%)`,
        '',
        'Consider:',
        '- Completing current subtask before starting new ones',
        '- Using TodoWrite to persist progress',
        '- Breaking remaining work into smaller chunks',
      ].join('\n'),
    });
  } else {
    writeOutput({ continue: true });
  }
}

main().catch(() => {
  writeOutput({ continue: true });
});

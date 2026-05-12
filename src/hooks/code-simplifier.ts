/**
 * Code Simplifier Hook (Stop)
 *
 * After the agent completes a response, suggests simplification
 * opportunities in recently modified files.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { loadConfig } from '../lib/config.js';
import { getActiveModes } from '../lib/state.js';
import type { HookInput } from '../types/hooks.js';

async function main() {
  const input = await parseStdinJson<HookInput>();
  const sessionId = input.session_id || 'unknown';

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const config = loadConfig(input.directory);
  if (!config.codeSimplifier.enabled) {
    writeOutput({ continue: true });
    return;
  }

  // Don't trigger during persistent modes (would interfere with continuation)
  const activeModes = getActiveModes(sessionId);
  if (activeModes.length > 0) {
    writeOutput({ continue: true });
    return;
  }

  // The code simplifier runs as a passive suggestion.
  // In a full implementation, it would analyze git diff for complexity indicators.
  // For now, inject a reminder to review complexity after large changes.
  writeOutput({
    continue: true,
    message: [
      '💡 **Code Simplifier**: Review completed changes for:',
      '- Unnecessary abstractions or over-engineering',
      '- Dead code that can be removed',
      '- Complex conditionals that can be simplified',
      '- Functions that do too many things',
    ].join('\n'),
  });
}

main().catch(() => {
  writeOutput({ continue: true });
});

/**
 * Session Start Hook (SessionStart)
 *
 * Restores active mode state from previous sessions and injects context.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { getActiveModes, readModeState } from '../lib/state.js';
import { loadConfig } from '../lib/config.js';
import type { HookInput } from '../types/hooks.js';

async function main() {
  const input = await parseStdinJson<HookInput>();
  const sessionId = input.session_id || 'unknown';

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const activeModes = getActiveModes(sessionId);

  if (activeModes.length === 0) {
    writeOutput({ continue: true });
    return;
  }

  // Build restoration message
  const modeDescriptions = activeModes.map(mode => {
    const state = readModeState(sessionId, mode);
    if (!state) return `- ${mode}: (stale, cleared)`;
    return `- **${mode}**: iteration ${state.iteration}/${state.maxIterations}`;
  });

  const message = [
    '📋 **oh-my-qoder: Active Modes Restored**',
    '',
    ...modeDescriptions,
    '',
    'Continuing from where we left off. Use `/cancel` to stop all modes.',
  ].join('\n');

  writeOutput({
    continue: true,
    message,
  });
}

main().catch(() => {
  writeOutput({ continue: true });
});

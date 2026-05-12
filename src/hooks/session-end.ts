/**
 * Session End Hook (SessionEnd)
 *
 * Persists final state, logs session summary, cleans up temporary resources.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { getActiveModes, readModeState, clearAllModeStates } from '../lib/state.js';
import type { HookInput } from '../types/hooks.js';

async function main() {
  const input = await parseStdinJson<HookInput>();
  const sessionId = input.session_id || 'unknown';

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  // Log active modes at session end for debugging
  const activeModes = getActiveModes(sessionId);
  if (activeModes.length > 0) {
    // Don't clear states on session end — they may be restored
    // Only clear stale states (handled by readModeState's staleness check)
  }

  writeOutput({ continue: true });
}

main().catch(() => {
  writeOutput({ continue: true });
});

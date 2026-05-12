/**
 * Pre-Compact Hook (PreCompact)
 *
 * Saves critical state before context window compaction.
 * Injects a summary of active modes, progress, and important context.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { getActiveModes, readModeState } from '../lib/state.js';
import type { HookInput } from '../types/hooks.js';
import type { RalphState, AutopilotState } from '../types/modes.js';

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

  const summaries: string[] = ['🧠 **oh-my-qoder: Pre-Compaction State Save**', ''];

  for (const mode of activeModes) {
    const state = readModeState(sessionId, mode);
    if (!state) continue;

    switch (mode) {
      case 'ralph': {
        const rs = state as RalphState;
        const done = rs.prd.stories.filter(s => s.passed).length;
        const total = rs.prd.stories.length;
        summaries.push(`**Ralph Mode** — Iteration ${rs.iteration}/${rs.maxIterations}, PRD: ${done}/${total} stories complete`);
        const remaining = rs.prd.stories.filter(s => !s.passed);
        if (remaining.length > 0) {
          summaries.push('Remaining:');
          remaining.forEach(s => summaries.push(`  - ${s.title}`));
        }
        break;
      }
      case 'autopilot': {
        const as = state as AutopilotState;
        const phases = ['Expansion', 'Design', 'Implementation', 'QA', 'Validation'];
        summaries.push(`**Autopilot Mode** — Phase ${as.phase} (${phases[as.phase]}), Iteration ${as.iteration}`);
        break;
      }
      default:
        summaries.push(`**${mode}** — Iteration ${state.iteration}/${state.maxIterations}`);
    }
  }

  summaries.push('', 'Continue from this state after compaction.');

  writeOutput({
    continue: true,
    message: summaries.join('\n'),
  });
}

main().catch(() => {
  writeOutput({ continue: true });
});

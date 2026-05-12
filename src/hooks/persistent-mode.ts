/**
 * Persistent Mode Hook (Stop)
 *
 * When an orchestration mode is active (ralph, autopilot), this hook
 * prevents the agent from stopping prematurely by injecting a continuation
 * prompt. The mode continues until:
 * - All acceptance criteria are met
 * - Max iterations reached
 * - User explicitly cancels
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { readModeState, writeModeState, getActiveModes } from '../lib/state.js';
import { loadConfig } from '../lib/config.js';
import type { HookInput } from '../types/hooks.js';
import type { RalphState, AutopilotState, ModeState } from '../types/modes.js';

function buildContinuationMessage(state: ModeState): string | null {
  switch (state.mode) {
    case 'ralph': {
      const rs = state as RalphState;
      const remaining = rs.prd.stories.filter(s => !s.passed);
      if (remaining.length === 0) return null; // All done
      return [
        `🔄 **Ralph: Continuing** (iteration ${rs.iteration + 1}/${rs.maxIterations})`,
        '',
        `Remaining stories: ${remaining.length}/${rs.prd.stories.length}`,
        remaining.map(s => `- [ ] ${s.title}`).join('\n'),
        '',
        'Continue working on the remaining items. Do NOT stop until all acceptance criteria pass.',
      ].join('\n');
    }
    case 'autopilot': {
      const as = state as AutopilotState;
      const phaseNames = ['Expansion', 'Design', 'Implementation', 'QA', 'Validation'];
      if (as.phase >= 4) return null; // All phases complete
      return [
        `🚀 **Autopilot: Phase ${as.phase} (${phaseNames[as.phase]}) complete**`,
        '',
        `Advancing to Phase ${as.phase + 1}: ${phaseNames[as.phase + 1]}`,
        '',
        'Continue with the next phase. Do NOT stop until all phases are complete.',
      ].join('\n');
    }
    default:
      return null;
  }
}

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

  const config = loadConfig(input.directory);

  // Process each active mode
  for (const mode of activeModes) {
    const state = readModeState(sessionId, mode);
    if (!state || !state.active) continue;

    // Check iteration limit
    if (state.iteration >= state.maxIterations) {
      writeOutput({
        continue: true,
        message: `⚠️ **${mode}** reached max iterations (${state.maxIterations}). Stopping.`,
      });
      state.active = false;
      writeModeState(sessionId, state);
      return;
    }

    // Build continuation message
    const continuation = buildContinuationMessage(state);
    if (!continuation) {
      // Mode is complete
      writeOutput({
        continue: true,
        message: `✅ **${mode}** mode complete! All objectives achieved.`,
      });
      state.active = false;
      writeModeState(sessionId, state);
      return;
    }

    // Increment iteration and persist
    state.iteration++;
    writeModeState(sessionId, state);

    // Inject continuation as user message to keep the agent going
    writeOutput({
      continue: true,
      userMessage: continuation,
    });
    return;
  }

  writeOutput({ continue: true });
}

main().catch(() => {
  writeOutput({ continue: true });
});

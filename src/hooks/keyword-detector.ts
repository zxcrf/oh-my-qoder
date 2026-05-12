/**
 * Keyword Detector Hook (UserPromptSubmit)
 *
 * Detects magic keywords in user prompts to activate orchestration modes.
 * Keywords: ralph, autopilot, auto, ultrawork, ulw, team, ultrathink, deepsearch
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { writeModeState, getActiveModes } from '../lib/state.js';
import { loadConfig } from '../lib/config.js';
import type { HookInput } from '../types/hooks.js';
import type { OrchestrationType, ModeState, RalphState, AutopilotState, UltraworkState } from '../types/modes.js';

interface KeywordMatch {
  keyword: string;
  mode: OrchestrationType;
  aliases: string[];
}

const KEYWORD_MAP: KeywordMatch[] = [
  { keyword: 'ralph', mode: 'ralph', aliases: ["don't stop", 'dont stop', 'keep going', 'persistent', 'never stop'] },
  { keyword: 'autopilot', mode: 'autopilot', aliases: ['auto', 'build me', 'autonomous', 'full auto'] },
  { keyword: 'ultrawork', mode: 'ultrawork', aliases: ['ulw', 'parallel', 'burst'] },
  { keyword: 'team', mode: 'team', aliases: ['delegate', 'multi-agent'] },
];

function detectKeyword(prompt: string): KeywordMatch | null {
  const lower = prompt.toLowerCase().trim();

  for (const entry of KEYWORD_MAP) {
    if (lower.startsWith(entry.keyword) || lower.includes(`/${entry.keyword}`)) {
      return entry;
    }
    for (const alias of entry.aliases) {
      if (lower.includes(alias)) {
        return entry;
      }
    }
  }

  return null;
}

function buildActivationMessage(match: KeywordMatch, sessionId: string): string {
  const messages: Record<OrchestrationType, string> = {
    ralph: `🔄 **Ralph Mode Activated** — Persistent execution enabled. I will not stop until the task is fully complete. Use \`/cancel\` to stop.`,
    autopilot: `🚀 **Autopilot Mode Activated** — Full autonomous pipeline engaged:\n  Phase 0: Idea Expansion → Phase 1: Design → Phase 2: Implementation → Phase 3: QA → Phase 4: Validation\n  Use \`/cancel\` to stop.`,
    ultrawork: `⚡ **Ultrawork Mode Activated** — Parallel burst execution. Multiple agents will work simultaneously on independent tasks.`,
    team: `👥 **Team Mode Activated** — Multi-agent delegation enabled. Tasks will be routed to specialized agents.`,
  };
  return messages[match.mode];
}

function createInitialState(mode: OrchestrationType, sessionId: string, config: ReturnType<typeof loadConfig>): ModeState {
  const base: ModeState = {
    mode,
    active: true,
    startedAt: new Date().toISOString(),
    iteration: 0,
    maxIterations: config.security.hardMaxIterations,
    sessionId,
  };

  switch (mode) {
    case 'ralph':
      return {
        ...base,
        maxIterations: config.modes.ralph.maxIterations,
        prd: { title: '', stories: [] },
        progress: [],
      } as RalphState;
    case 'autopilot':
      return {
        ...base,
        phase: 0,
        phaseHistory: [],
      } as AutopilotState;
    case 'ultrawork':
      return {
        ...base,
        tasks: [],
      } as UltraworkState;
    default:
      return base;
  }
}

async function main() {
  const input = await parseStdinJson<HookInput>();
  const prompt = input.prompt || '';
  const sessionId = input.session_id || 'unknown';

  if (!prompt) {
    writeOutput({ continue: true });
    return;
  }

  // Check for kill switch
  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const match = detectKeyword(prompt);
  if (!match) {
    writeOutput({ continue: true });
    return;
  }

  const config = loadConfig(input.directory);

  // Check if mode is enabled
  const modeConfig = config.modes[match.mode as keyof typeof config.modes];
  if (modeConfig && 'enabled' in modeConfig && !modeConfig.enabled) {
    writeOutput({ continue: true });
    return;
  }

  // Check if already in this mode
  const activeModes = getActiveModes(sessionId);
  if (activeModes.includes(match.mode)) {
    writeOutput({
      continue: true,
      message: `⚠️ ${match.mode} mode is already active (iteration ${activeModes.length}). Continuing...`,
    });
    return;
  }

  // Activate the mode
  const state = createInitialState(match.mode, sessionId, config);
  writeModeState(sessionId, state);

  const message = buildActivationMessage(match, sessionId);
  writeOutput({
    continue: true,
    message,
  });
}

main().catch(() => {
  writeOutput({ continue: true });
});

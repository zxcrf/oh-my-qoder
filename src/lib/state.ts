import { join } from 'path';
import { existsSync, unlinkSync, readdirSync } from 'fs';
import { getStateDir } from './paths.js';
import { atomicWriteJson, readJsonSafe } from './atomic-write.js';
import type { ModeState, OrchestrationType } from '../types/modes.js';

const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

export function getModeStatePath(sessionId: string, mode: OrchestrationType): string {
  return join(getStateDir(sessionId), `${mode}-state.json`);
}

export function readModeState<T extends ModeState>(sessionId: string, mode: OrchestrationType): T | null {
  const path = getModeStatePath(sessionId, mode);
  const state = readJsonSafe<T | null>(path, null);
  if (!state) return null;

  // Check staleness
  const elapsed = Date.now() - new Date(state.startedAt).getTime();
  if (elapsed > STALE_THRESHOLD_MS) {
    clearModeState(sessionId, mode);
    return null;
  }

  return state;
}

export function writeModeState(sessionId: string, state: ModeState): void {
  const path = getModeStatePath(sessionId, state.mode);
  atomicWriteJson(path, state);
}

export function clearModeState(sessionId: string, mode: OrchestrationType): void {
  const path = getModeStatePath(sessionId, mode);
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

export function clearAllModeStates(sessionId: string): void {
  const dir = getStateDir(sessionId);
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter(f => f.endsWith('-state.json'));
  for (const file of files) {
    unlinkSync(join(dir, file));
  }
}

export function getActiveModes(sessionId: string): OrchestrationType[] {
  const dir = getStateDir(sessionId);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter(f => f.endsWith('-state.json'));
  return files.map(f => f.replace('-state.json', '') as OrchestrationType);
}

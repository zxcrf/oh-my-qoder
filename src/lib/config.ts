import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getOmqHome, getProjectStateDir } from './paths.js';
import { readJsonSafe } from './atomic-write.js';
import type { OmqConfig } from '../types/config.js';

const DEFAULT_CONFIG: OmqConfig = {
  modes: {
    ralph: { enabled: true, maxIterations: 50, defaultCritic: 'critic' },
    autopilot: { enabled: true, maxQaCycles: 5 },
    ultrawork: { enabled: true },
  },
  codeSimplifier: { enabled: true, extensions: ['.ts', '.js', '.py', '.go', '.rs'], maxFiles: 10 },
  contextGuard: { enabled: true, threshold: 85 },
  projectMemory: { enabled: true },
  security: { hardMaxIterations: 200 },
};

export function loadConfig(cwd?: string): OmqConfig {
  // Project-level takes priority
  const projectConfig = join(getProjectStateDir(cwd), 'omq.jsonc');
  if (existsSync(projectConfig)) {
    const config = readJsonSafe<Partial<OmqConfig>>(projectConfig, {});
    return { ...DEFAULT_CONFIG, ...config };
  }

  // User-level
  const userConfig = join(getOmqHome(), 'config.jsonc');
  if (existsSync(userConfig)) {
    const config = readJsonSafe<Partial<OmqConfig>>(userConfig, {});
    return { ...DEFAULT_CONFIG, ...config };
  }

  return DEFAULT_CONFIG;
}

export { DEFAULT_CONFIG };

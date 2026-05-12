import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname_resolved = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url));

export function getPluginRoot(): string {
  if (process.env.QODER_PLUGIN_ROOT) {
    return process.env.QODER_PLUGIN_ROOT;
  }
  // Fallback: resolve from this file's location (src/lib/ → project root)
  return join(__dirname_resolved, '..', '..');
}

export function getOmqHome(): string {
  return join(homedir(), '.qoder', 'omq');
}

export function getStateDir(sessionId?: string): string {
  const base = join(getOmqHome(), 'state');
  return sessionId ? join(base, sessionId) : base;
}

export function getConfigPath(): string {
  return join(getOmqHome(), 'config.jsonc');
}

export function getProjectStateDir(cwd?: string): string {
  const dir = cwd || process.cwd();
  return join(dir, '.omq');
}

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

export function atomicWriteJson(filePath: string, data: unknown): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const content = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(filePath, content, 'utf-8');
}

export function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

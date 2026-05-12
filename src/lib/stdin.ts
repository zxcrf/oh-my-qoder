import { readFileSync } from 'fs';

const STDIN_TIMEOUT_MS = 5000;

export async function readStdin(timeoutMs = STDIN_TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve('{}');
    }, timeoutMs);

    const chunks: Buffer[] = [];

    process.stdin.on('data', (chunk) => {
      chunks.push(chunk);
    });

    process.stdin.on('end', () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });

    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolve('{}');
    });

    // Handle TTY (no piped input)
    if (process.stdin.isTTY) {
      clearTimeout(timer);
      resolve('{}');
    }
  });
}

export async function parseStdinJson<T = Record<string, unknown>>(timeoutMs?: number): Promise<T> {
  const raw = await readStdin(timeoutMs);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

export function writeOutput(output: Record<string, unknown>): void {
  process.stdout.write(JSON.stringify(output) + '\n');
}

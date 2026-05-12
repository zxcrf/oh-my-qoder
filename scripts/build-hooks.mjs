import * as esbuild from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';

const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  external: [
    'fs', 'fs/promises', 'path', 'os', 'util', 'stream', 'events',
    'buffer', 'crypto', 'http', 'https', 'url', 'child_process',
    'assert', 'module', 'net', 'tls', 'readline', 'tty',
    'worker_threads', 'node:fs', 'node:path', 'node:os',
    'node:url', 'node:crypto', 'node:child_process', 'node:util',
  ],
};

const hookFiles = readdirSync('src/hooks')
  .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
  .map(f => join('src/hooks', f));

if (hookFiles.length === 0) {
  console.log('No hook files found to build.');
  process.exit(0);
}

await esbuild.build({
  ...sharedConfig,
  entryPoints: hookFiles,
  outdir: 'hooks/scripts',
  outExtension: { '.js': '.mjs' },
  splitting: false,
});

console.log(`Built ${hookFiles.length} hook scripts → hooks/scripts/`);

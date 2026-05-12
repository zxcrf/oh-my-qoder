import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'bridge/cli.cjs',
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: [
    'fs', 'fs/promises', 'path', 'os', 'util', 'stream', 'events',
    'buffer', 'crypto', 'http', 'https', 'url', 'child_process',
    'assert', 'module', 'net', 'tls', 'readline', 'tty',
    'worker_threads', 'commander', 'zod',
  ],
});

console.log('Built CLI → bridge/cli.cjs');

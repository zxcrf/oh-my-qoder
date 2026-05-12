#!/usr/bin/env node
/**
 * Cross-platform hook runner for oh-my-qoder.
 * Spawns the target hook script using the current Node.js binary.
 * Passes stdin through and captures stdout/stderr.
 * Exits fail-open (never blocks the host CLI).
 */
'use strict';

const { spawnSync } = require('child_process');
const { resolve } = require('path');

const targetScript = process.argv[2];
const extraArgs = process.argv.slice(3);

if (!targetScript) {
  process.stdout.write(JSON.stringify({ continue: true }) + '\n');
  process.exit(0);
}

// Resolve QODER_PLUGIN_ROOT
const pluginRoot = process.env.QODER_PLUGIN_ROOT || resolve(__dirname, '..');
process.env.QODER_PLUGIN_ROOT = pluginRoot;

// Read stdin (hook input)
let stdinData = '';
try {
  stdinData = require('fs').readFileSync(0, 'utf-8');
} catch {
  stdinData = '{}';
}

// Determine timeout from hooks.json or default 10s
const DEFAULT_TIMEOUT_MS = 10000;
let timeoutMs = DEFAULT_TIMEOUT_MS;

// Spawn the hook script
try {
  const result = spawnSync(process.execPath, [targetScript, ...extraArgs], {
    input: stdinData,
    encoding: 'utf-8',
    timeout: timeoutMs,
    env: {
      ...process.env,
      QODER_PLUGIN_ROOT: pluginRoot,
      NODE_NO_WARNINGS: '1',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.status === 0 && result.stdout) {
    // Forward the hook's JSON output
    const output = result.stdout.trim();
    if (output) {
      process.stdout.write(output + '\n');
    } else {
      process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    }
  } else {
    // Fail-open on error
    process.stdout.write(JSON.stringify({ continue: true }) + '\n');
  }
} catch (err) {
  // Fail-open on any exception (timeout, spawn error, etc.)
  process.stdout.write(JSON.stringify({ continue: true }) + '\n');
}

import { Command } from 'commander';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const statusCommand = new Command('status')
  .description('Show current oh-my-qoder status and active modes')
  .option('-s, --session <id>', 'Session ID to check')
  .action((options) => {
    const omqHome = join(homedir(), '.qoder', 'omq');
    const stateDir = join(omqHome, 'state');

    console.log('📊 oh-my-qoder Status\n');

    // Check installation
    if (!existsSync(omqHome)) {
      console.log('  ✗ Not installed. Run "oh-my-qoder setup" first.');
      return;
    }
    console.log('  ✓ Installed');

    // Check active modes
    if (!existsSync(stateDir)) {
      console.log('  No active sessions.');
      return;
    }

    const sessions = readdirSync(stateDir).filter(f => {
      const fullPath = join(stateDir, f);
      try {
        return readdirSync(fullPath).length > 0;
      } catch {
        return false;
      }
    });

    if (sessions.length === 0) {
      console.log('  No active modes.');
      return;
    }

    console.log(`\n  Active sessions: ${sessions.length}\n`);

    for (const session of sessions) {
      const sessionDir = join(stateDir, session);
      const files = readdirSync(sessionDir).filter(f => f.endsWith('-state.json'));

      if (files.length > 0) {
        console.log(`  Session: ${session}`);
        for (const file of files) {
          const mode = file.replace('-state.json', '');
          try {
            const state = JSON.parse(
              require('fs').readFileSync(join(sessionDir, file), 'utf-8')
            );
            console.log(`    • ${mode}: iteration ${state.iteration}/${state.maxIterations} (${state.active ? 'active' : 'inactive'})`);
          } catch {
            console.log(`    • ${mode}: (corrupted state)`);
          }
        }
      }
    }
  });

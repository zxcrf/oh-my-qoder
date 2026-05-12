import { Command } from 'commander';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

export const setupCommand = new Command('setup')
  .description('Install and configure oh-my-qoder for Qoder CLI')
  .option('--force', 'Overwrite existing configuration')
  .action((options) => {
    console.log('🔧 Setting up oh-my-qoder...\n');

    const omqHome = join(homedir(), '.qoder', 'omq');
    const stateDir = join(omqHome, 'state');
    const configPath = join(omqHome, 'config.jsonc');

    // Step 1: Create directories
    console.log('  Creating directories...');
    mkdirSync(stateDir, { recursive: true });
    console.log(`  ✓ ${omqHome}`);
    console.log(`  ✓ ${stateDir}`);

    // Step 2: Write default config
    if (!existsSync(configPath) || options.force) {
      console.log('\n  Writing default configuration...');
      const defaultConfig = {
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
      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + '\n');
      console.log(`  ✓ ${configPath}`);
    } else {
      console.log(`\n  ⏭ Configuration already exists (use --force to overwrite)`);
    }

    // Step 3: Check Qoder CLI
    console.log('\n  Checking Qoder CLI...');
    try {
      const version = execSync('qodercli --version', { encoding: 'utf-8' }).trim();
      console.log(`  ✓ Qoder CLI found: ${version}`);
    } catch {
      console.log('  ⚠ Qoder CLI not found in PATH. Install it first.');
    }

    // Step 4: Verify Node.js version
    const nodeVersion = process.versions.node;
    const major = parseInt(nodeVersion.split('.')[0]);
    if (major >= 20) {
      console.log(`  ✓ Node.js ${nodeVersion} (>=20 required)`);
    } else {
      console.log(`  ✗ Node.js ${nodeVersion} — version 20+ required`);
    }

    console.log('\n✅ oh-my-qoder setup complete!');
    console.log('\nUsage:');
    console.log('  In Qoder CLI, use magic keywords to activate modes:');
    console.log('  • "ralph" — Persistent execution until complete');
    console.log('  • "autopilot" — Full autonomous pipeline');
    console.log('  • "ultrawork" — Parallel burst execution');
    console.log('  • "/cancel" — Stop all active modes');
    console.log('\n  Run "oh-my-qoder doctor" to verify installation.');
  });

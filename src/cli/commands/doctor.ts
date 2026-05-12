import { Command } from 'commander';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

export const doctorCommand = new Command('doctor')
  .description('Diagnose oh-my-qoder installation and configuration')
  .action(() => {
    console.log('🩺 oh-my-qoder Doctor\n');

    let issues = 0;

    // 1. Check Node.js version
    const nodeVersion = process.versions.node;
    const major = parseInt(nodeVersion.split('.')[0]);
    if (major >= 20) {
      console.log(`  ✓ Node.js ${nodeVersion}`);
    } else {
      console.log(`  ✗ Node.js ${nodeVersion} — version 20+ required`);
      issues++;
    }

    // 2. Check Qoder CLI
    try {
      const version = execSync('qodercli --version', { encoding: 'utf-8' }).trim();
      console.log(`  ✓ Qoder CLI: ${version}`);
    } catch {
      console.log('  ✗ Qoder CLI not found in PATH');
      issues++;
    }

    // 3. Check omq home directory
    const omqHome = join(homedir(), '.qoder', 'omq');
    if (existsSync(omqHome)) {
      console.log(`  ✓ Config directory: ${omqHome}`);
    } else {
      console.log(`  ✗ Config directory missing: ${omqHome}`);
      console.log('    Run "oh-my-qoder setup" to create it');
      issues++;
    }

    // 4. Check config file
    const configPath = join(omqHome, 'config.jsonc');
    if (existsSync(configPath)) {
      console.log(`  ✓ Configuration: ${configPath}`);
    } else {
      console.log(`  ✗ Configuration missing: ${configPath}`);
      issues++;
    }

    // 5. Check plugin manifest
    const scriptDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    const pluginRoot = process.env.QODER_PLUGIN_ROOT || join(scriptDir, '..');
    const manifestPath = join(pluginRoot, '.qoder-plugin', 'plugin.json');
    if (existsSync(manifestPath)) {
      console.log(`  ✓ Plugin manifest: ${manifestPath}`);
    } else {
      console.log(`  ⚠ Plugin manifest not found (expected at ${manifestPath})`);
    }

    // 6. Check hooks
    const hooksPath = join(pluginRoot, 'hooks', 'hooks.json');
    if (existsSync(hooksPath)) {
      console.log(`  ✓ Hooks configuration: ${hooksPath}`);
    } else {
      console.log(`  ✗ Hooks configuration missing: ${hooksPath}`);
      issues++;
    }

    // 7. Check agents directory
    const agentsDir = join(pluginRoot, 'agents');
    if (existsSync(agentsDir)) {
      const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      console.log(`  ✓ Agents: ${agents.length} defined`);
    } else {
      console.log(`  ✗ Agents directory missing`);
      issues++;
    }

    // 8. Check skills directory
    const skillsDir = join(pluginRoot, 'skills');
    if (existsSync(skillsDir)) {
      const skills = readdirSync(skillsDir);
      console.log(`  ✓ Skills: ${skills.length} defined`);
    } else {
      console.log(`  ✗ Skills directory missing`);
      issues++;
    }

    // 9. Check bridge/hooks (built hook scripts)
    const distHooks = join(pluginRoot, 'bridge', 'hooks');
    if (existsSync(distHooks)) {
      const built = readdirSync(distHooks).filter(f => f.endsWith('.mjs'));
      console.log(`  ✓ Built hooks: ${built.length} scripts`);
    } else {
      console.log(`  ⚠ Built hooks not found — run "npm run build" first`);
    }

    // Summary
    console.log('');
    if (issues === 0) {
      console.log('  ✅ All checks passed! oh-my-qoder is ready.');
    } else {
      console.log(`  ⚠️  ${issues} issue(s) found. Fix them and run doctor again.`);
    }
  });

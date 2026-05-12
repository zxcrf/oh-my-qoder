---
name: setup
description: Install and configure oh-my-qoder for Qoder CLI
trigger: setup, install, configure omq
---

# Setup Skill

Install and configure oh-my-qoder for your Qoder CLI environment.

## What This Does

1. Creates the oh-my-qoder configuration directory (`~/.qoder/omq/`)
2. Writes default configuration (`~/.qoder/omq/config.jsonc`)
3. Registers hooks with Qoder CLI
4. Verifies the installation

## Steps

### 1. Create Config Directory
```bash
mkdir -p ~/.qoder/omq/state
```

### 2. Write Default Configuration
Create `~/.qoder/omq/config.jsonc` with default settings for all modes and features.

### 3. Verify Installation
- Check that hooks.json is accessible
- Check that agent definitions are present
- Check that skills are registered

## Configuration Options

After setup, customize `~/.qoder/omq/config.jsonc`:

```jsonc
{
  // Orchestration modes
  "modes": {
    "ralph": { "enabled": true, "maxIterations": 50 },
    "autopilot": { "enabled": true, "maxQaCycles": 5 },
    "ultrawork": { "enabled": true }
  },
  // Enhancement hooks
  "codeSimplifier": { "enabled": true },
  "contextGuard": { "enabled": true, "threshold": 85 },
  "projectMemory": { "enabled": true }
}
```

## Troubleshooting

If hooks don't trigger:
- Ensure `QODER_PLUGIN_ROOT` points to the oh-my-qoder package
- Run `oh-my-qoder doctor` to diagnose issues
- Check that Node.js >= 20 is available

# oh-my-qoder

A powerful multi-agent orchestration plugin for [Qoder CLI](https://qoder.dev). Adds 19 specialized agents, persistent execution modes, and intelligent hook-based enhancements — zero learning curve, maximum power.

Inspired by [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode).

## Quick Start

```bash
# Clone and build
git clone https://github.com/zxcrf/oh-my-qoder.git
cd oh-my-qoder
npm install
npm run build

# Install as Qoder CLI plugin
qodercli plugins install .

# Verify
qodercli plugins list
qodercli skills list --all | grep oh-my-qoder
```

That's it. Open a new `qodercli` session from any directory and everything is active.

## Features

### Multi-Agent System (19 Specialized Agents)

Each agent has a defined model tier, role scope, and tool restrictions:

| Agent | Model Tier | Role | Restrictions |
|-------|-----------|------|--------------|
| architect | ultimate | Strategic architecture & debugging advisor | Read-only |
| analyst | ultimate | Requirements extraction & spec generation | Read-only |
| planner | ultimate | Task decomposition & implementation planning | Read-only |
| critic | ultimate | Plan/code review & quality critique | Read-only |
| scientist | ultimate | Research, experimentation & benchmarking | Full access |
| security-reviewer | ultimate | STRIDE/OWASP vulnerability detection | Read-only |
| executor | performance | Code implementation | Full access |
| debugger | performance | Root-cause analysis & bug fixing | Full access |
| test-engineer | performance | Test creation & coverage analysis | Full access |
| code-reviewer | performance | Code quality & maintainability review | Read-only |
| code-simplifier | performance | Complexity reduction & dead code removal | Full access |
| designer | performance | API/UX interface design | No shell |
| document-specialist | performance | Documentation authoring | Full access |
| git-master | performance | Git operations & branch strategy | Shell only |
| verifier | performance | Acceptance criteria validation | Read + shell |
| qa-tester | performance | Integration & regression testing | Full access |
| writer | performance | Technical content & release notes | Full access |
| explore | efficient | Fast codebase navigation & search | Read-only |
| tracer | efficient | Execution flow & data flow tracing | Read-only |

**Model tier mapping:**
- `ultimate` — Highest reasoning capability, for strategic decisions and complex analysis
- `performance` — Balanced cost/quality, for implementation work
- `efficient` — Fast and cheap, for quick exploration tasks

### Orchestration Modes

#### Ralph Mode (`ralph`)
Persistent, PRD-driven execution loop. Generates a Product Requirements Document with user stories and acceptance criteria, then iterates until ALL pass. Won't stop voluntarily.

```
ralph fix all the failing tests and add missing coverage
```

#### Autopilot Mode (`autopilot`)
Full 5-phase autonomous pipeline:
1. **Phase 0: Expansion** — Expand idea into detailed specification
2. **Phase 1: Design** — Architecture decisions and component breakdown
3. **Phase 2: Implementation** — Parallel code execution
4. **Phase 3: QA** — Test, fix, iterate (up to 5 cycles)
5. **Phase 4: Validation** — Multi-perspective review (critic + security + code-reviewer)

```
autopilot build me a REST API for user management with JWT auth
```

#### Ultrawork Mode (`ultrawork`)
Parallel burst execution — decomposes work into independent subtasks and fires 2-5 agents simultaneously. One-shot, no persistence loop.

```
ultrawork refactor the auth module, update tests, and fix the docs
```

#### Team Mode (`team`)
Explicit multi-agent delegation with customizable pipelines:
- New features: Analyst → Planner → Executor → Test-Engineer → Verifier
- Bug fixes: Debugger → Executor → Test-Engineer → Verifier
- Refactoring: Architect → Code-Reviewer → Executor → Code-Simplifier
- Security: Security-Reviewer → Executor → Test-Engineer → Verifier

### Hook-Based Enhancements (10 Hooks, 7 Events)

| Hook | Event | Purpose |
|------|-------|---------|
| keyword-detector | UserPromptSubmit | Detects magic keywords and activates modes |
| session-start | SessionStart | Restores active mode state from previous sessions |
| pre-tool-enforcer | PreToolUse | Enforces tool restrictions per agent type |
| post-tool-verifier | PostToolUse | Detects secrets, validates tool outputs |
| project-memory | PostToolUse | Learns file patterns and project structure |
| context-guard | Stop | Warns at configurable context usage threshold |
| persistent-mode | Stop | Injects continuation prompts for active modes |
| code-simplifier | Stop | Suggests complexity reduction opportunities |
| pre-compact | PreCompact | Saves mode state before context compaction |
| project-memory | PreCompact | Preserves learned context across compaction |
| session-end | SessionEnd | Cleanup and state persistence |

All hooks are **fail-open** — if a hook errors or times out, execution continues normally.

### Skills (8 Slash Commands)

| Skill | Trigger | Description |
|-------|---------|-------------|
| `/oh-my-qoder:ralph` | ralph, don't stop, keep going | Persistent execution until complete |
| `/oh-my-qoder:autopilot` | autopilot, auto, build me | Full autonomous pipeline |
| `/oh-my-qoder:ultrawork` | ultrawork, ulw, parallel | Parallel burst execution |
| `/oh-my-qoder:team` | team, delegate | Multi-agent team delegation |
| `/oh-my-qoder:plan` | plan, design, architect | Structured planning mode |
| `/oh-my-qoder:deep-interview` | interview, clarify, socratic | Socratic questioning before execution |
| `/oh-my-qoder:cancel` | cancel, stop, abort | Cancel all active modes |
| `/oh-my-qoder:setup` | setup, install | Plugin setup and configuration |

## Installation

### From Source (Recommended)

```bash
git clone https://github.com/zxcrf/oh-my-qoder.git
cd oh-my-qoder
npm install
npm run build
qodercli plugins install .
```

### Verify Installation

```bash
# Check plugin is loaded
qodercli plugins list

# Check all skills are available
qodercli skills list --all | grep oh-my-qoder

# Validate plugin structure
qodercli plugins validate .
```

### Run Setup (Optional)

```bash
oh-my-qoder setup    # Creates ~/.qoder/omq/ config directory
oh-my-qoder doctor   # Diagnoses any issues
```

## Usage

### Magic Keywords

Just include these keywords in your prompt — the keyword detector hook activates the mode automatically:

| Keyword | Mode Activated |
|---------|---------------|
| `ralph`, `don't stop`, `keep going`, `persistent` | Ralph |
| `autopilot`, `auto`, `build me`, `autonomous` | Autopilot |
| `ultrawork`, `ulw`, `parallel`, `burst` | Ultrawork |
| `team`, `delegate`, `multi-agent` | Team |

### Slash Commands

```
/oh-my-qoder:ralph
/oh-my-qoder:autopilot
/oh-my-qoder:ultrawork
/oh-my-qoder:plan
/oh-my-qoder:cancel
```

### Cancel Active Modes

```
/oh-my-qoder:cancel
```

Or set environment variable: `DISABLE_OMQ=1`

## Configuration

### Default Config (`~/.qoder/omq/config.jsonc`)

Created by `oh-my-qoder setup`:

```jsonc
{
  "modes": {
    "ralph": {
      "enabled": true,
      "maxIterations": 50,      // Max loops before forced stop
      "defaultCritic": "critic" // Agent used for verification
    },
    "autopilot": {
      "enabled": true,
      "maxQaCycles": 5          // Max QA fix-and-retry cycles
    },
    "ultrawork": {
      "enabled": true
    }
  },
  "codeSimplifier": {
    "enabled": true,
    "extensions": [".ts", ".js", ".py", ".go", ".rs"],
    "maxFiles": 10
  },
  "contextGuard": {
    "enabled": true,
    "threshold": 85             // Warn at this % of context window
  },
  "projectMemory": {
    "enabled": true
  },
  "security": {
    "hardMaxIterations": 200    // Absolute maximum for any mode
  }
}
```

### Project-Level Override

Create `.omq/omq.jsonc` in your project root to override settings per-project.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DISABLE_OMQ` | — | Set to `1` to disable all oh-my-qoder hooks |
| `QODER_PLUGIN_ROOT` | (auto) | Plugin installation root (set by Qoder CLI) |
| `OMQ_CURRENT_AGENT` | — | Current agent name (for tool enforcement) |

## CLI Commands

```bash
oh-my-qoder setup [--force]   # Install config, create directories
oh-my-qoder status [-s ID]    # Show active modes and iterations
oh-my-qoder doctor            # Full diagnostic check
```

## Development

```bash
# Clone
git clone https://github.com/zxcrf/oh-my-qoder.git
cd oh-my-qoder

# Install dependencies
npm install

# Build (TypeScript + esbuild hooks + CLI bundle)
npm run build

# Rebuild and reinstall plugin after changes
npm run reinstall

# Watch TypeScript for errors during development
npm run dev

# Run tests
npm test
```

### Build Outputs

```
bridge/
├── cli.cjs           # Bundled CLI (CommonJS, executable)
└── hooks/            # Bundled hook scripts (ESM, .mjs)
    ├── keyword-detector.mjs
    ├── session-start.mjs
    ├── persistent-mode.mjs
    ├── context-guard.mjs
    ├── code-simplifier.mjs
    ├── pre-tool-enforcer.mjs
    ├── post-tool-verifier.mjs
    ├── project-memory.mjs
    ├── pre-compact.mjs
    └── session-end.mjs
```

## Architecture

```
oh-my-qoder/
├── .qoder-plugin/
│   └── plugin.json           # Plugin manifest (skills + hooks registration)
├── src/
│   ├── hooks/                # Hook implementations (TypeScript)
│   ├── lib/                  # Core: stdin, state, config, paths, atomic-write
│   ├── cli/                  # CLI: setup, status, doctor
│   ├── types/                # TypeScript interfaces
│   └── index.ts              # Library exports
├── agents/                   # 19 agent definitions (YAML frontmatter + markdown)
├── skills/                   # 8 skill definitions (SKILL.md per skill)
├── hooks/
│   └── hooks.json            # Hook event → command mapping
├── scripts/
│   ├── run.cjs               # Cross-platform hook runner (fail-open)
│   ├── build-hooks.mjs       # esbuild: hooks → bridge/hooks/*.mjs
│   └── build-cli.mjs         # esbuild: CLI → bridge/cli.cjs
├── bridge/                   # Built outputs (gitignored)
├── package.json
└── tsconfig.json
```

### Hook Execution Flow

```
Qoder CLI Event (e.g., UserPromptSubmit)
    │
    ▼
hooks/hooks.json → registered shell command
    │
    ▼
scripts/run.cjs (spawns hook with process.execPath)
    │  stdin: JSON (HookInput)
    ▼
bridge/hooks/<hook>.mjs (bundled TypeScript)
    │  Process → decide → output
    ▼
stdout: JSON (HookOutput)
    │
    ▼
Qoder CLI applies result:
  { continue: true }                    → pass through
  { continue: true, message: "..." }    → inject context
  { decision: "block", reason: "..." }  → block the action
  { userMessage: "..." }                → inject as user turn (continuation)
```

## Requirements

- Node.js >= 20
- Qoder CLI (qodercli)

## License

MIT

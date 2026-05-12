---
name: autopilot
description: Full autonomous pipeline — from idea to validated implementation
trigger: autopilot, auto, build me, autonomous
---

# Autopilot Mode

You are now operating in **Autopilot Mode** — a 5-phase autonomous execution pipeline. You will progress through all phases without user intervention.

## Pipeline Phases

### Phase 0: Idea Expansion
- Expand the user's request into a detailed specification
- Identify scope, constraints, and success criteria
- Ask NO questions — make reasonable assumptions and document them

### Phase 1: Technical Design
- Use the `architect` agent perspective for high-level design
- Use the `analyst` agent perspective to validate requirements
- Produce: architecture decisions, component breakdown, dependency map
- Output a clear technical plan

### Phase 2: Implementation
- Execute the plan from Phase 1
- Write clean, tested, production-quality code
- Use multiple subagents for independent modules when possible
- Follow established patterns in the codebase

### Phase 3: Quality Assurance
- Run all tests, fix failures
- Use `test-engineer` perspective for coverage gaps
- Use `debugger` perspective for any issues found
- Iterate until all tests pass (max 5 QA cycles)

### Phase 4: Validation
- Use `critic` perspective to review all changes
- Use `security-reviewer` perspective for security audit
- Use `code-reviewer` perspective for quality check
- Verify against Phase 0 specification

## Rules

- Progress through phases sequentially — do not skip
- Document phase transitions explicitly
- If a phase fails, fix and retry (do not regress)
- Max 5 QA cycles in Phase 3 before accepting
- Use `/cancel` to abort

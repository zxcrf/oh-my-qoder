---
name: plan
description: Structured planning mode with multi-perspective analysis
trigger: plan, design, architect
---

# Plan Mode

You are now in **Plan Mode** — structured, multi-perspective planning before any implementation.

## Protocol

### Step 1: Requirements Analysis
- Extract explicit and implicit requirements from the user's request
- Identify constraints, assumptions, and unknowns
- List acceptance criteria

### Step 2: Exploration
- Use the Explore agent to understand relevant codebase areas
- Identify existing patterns, utilities, and conventions to follow
- Map dependencies and impact areas

### Step 3: Architecture Design
- Design the solution at a high level
- Consider at least 2 alternative approaches
- Evaluate trade-offs (complexity, performance, maintainability)
- Select and justify the recommended approach

### Step 4: Implementation Plan
- Break down into ordered, atomic steps
- Identify which files will be created/modified
- Estimate scope per step (small/medium/large)
- Note testing strategy for each step

### Step 5: Review
- Apply the `critic` perspective to the plan
- Identify potential failure points
- Add contingency for risky steps

## Output Format

```markdown
## Plan: [Title]

### Requirements
- ...

### Approach
[Selected approach with justification]

### Steps
1. [Step] — [Files] — [Size]
2. ...

### Risks & Mitigations
- ...

### Verification
- ...
```

## Rules

- Do NOT write code in plan mode
- Ask clarifying questions if requirements are ambiguous
- Plans should be executable by the `executor` agent without further clarification

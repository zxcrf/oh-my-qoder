---
name: team
description: Multi-agent team delegation with explicit role assignment
trigger: team, delegate, multi-agent
---

# Team Mode

You are now operating in **Team Mode** — explicit multi-agent delegation with specialized roles.

## Protocol

1. **Assess**: Analyze the task and determine which specialists are needed
2. **Compose**: Select a team of 2-5 agents with complementary skills
3. **Delegate**: Assign clear, scoped subtasks to each agent
4. **Coordinate**: Manage dependencies and information flow between agents
5. **Deliver**: Synthesize agent outputs into a unified result

## Team Composition Guidelines

For **new features**:
- Analyst → Planner → Executor → Test-Engineer → Verifier

For **bug fixes**:
- Debugger → Executor → Test-Engineer → Verifier

For **refactoring**:
- Architect → Code-Reviewer → Executor → Code-Simplifier

For **security hardening**:
- Security-Reviewer → Executor → Test-Engineer → Verifier

For **documentation**:
- Explore → Architect → Document-Specialist

## Rules

- Each agent receives a focused, self-contained task description
- Provide full context to each agent (don't assume shared state)
- Sequential agents receive the output of previous agents as input
- The coordinator (you) resolves conflicts between agent recommendations
- Use the Agent tool with appropriate model tiers for cost efficiency
- Always include a verification step as the final agent in the pipeline

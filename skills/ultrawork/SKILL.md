---
name: ultrawork
description: Parallel burst execution — fire multiple agents simultaneously
trigger: ultrawork, ulw, parallel, burst
---

# Ultrawork Mode

You are now operating in **Ultrawork Mode** — maximum parallelism for rapid task completion.

## Protocol

1. **Decompose**: Break the task into independent, parallelizable subtasks
2. **Assign**: Route each subtask to the most appropriate specialized agent
3. **Execute**: Launch all independent agents simultaneously using the Agent tool
4. **Synthesize**: Collect results and integrate them

## Agent Routing

Route tasks based on their nature:
- Architecture questions → `architect` (ultimate model)
- Code implementation → `executor` (performance model)
- Bug fixes → `debugger` (performance model)
- Test creation → `test-engineer` (performance model)
- Code exploration → `explore` (efficient model)
- Security concerns → `security-reviewer` (ultimate model)

## Rules

- Launch at minimum 2 agents, maximum 5 agents in parallel
- Each agent task must be INDEPENDENT (no dependencies between parallel tasks)
- If tasks have dependencies, execute them in sequential waves
- After all agents complete, synthesize results into a coherent deliverable
- This is a one-shot mode — no persistence loops
- Prefer breadth over depth: many focused agents > one overloaded agent

## Output

After all parallel tasks complete, provide:
1. Summary of what each agent accomplished
2. Integration of all results
3. Any conflicts or inconsistencies found between agent outputs

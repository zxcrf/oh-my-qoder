---
name: cancel
description: Cancel all active orchestration modes
trigger: cancel, stop, abort
---

# Cancel Mode

Immediately cancel all active oh-my-qoder orchestration modes.

## Action

When this skill is invoked:

1. Clear all active mode states (ralph, autopilot, ultrawork, team)
2. Report what was cancelled
3. Return control to normal interactive mode

## Implementation

To cancel, clear the state files at `~/.qoder/omq/state/{sessionId}/`:
- Remove all `*-state.json` files
- Confirm cancellation to the user

## Response

After cancellation, respond with:

```
All oh-my-qoder modes cancelled:
- [list of modes that were active]

Returning to normal interactive mode.
```

If no modes were active:
```
No active oh-my-qoder modes to cancel.
```

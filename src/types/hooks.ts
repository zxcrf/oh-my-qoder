export type HookEvent =
  | 'UserPromptSubmit'
  | 'SessionStart'
  | 'SessionEnd'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Stop'
  | 'PreCompact';

export interface HookInput {
  session_id?: string;
  event?: HookEvent;
  timestamp?: string;
  // UserPromptSubmit
  prompt?: string;
  // Stop
  stop_reason?: string;
  context_usage?: number;
  // PreToolUse / PostToolUse
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: string;
  // General
  directory?: string;
  message?: { content?: string };
}

export interface HookOutput {
  continue?: boolean;
  suppressOutput?: boolean;
  decision?: 'block' | 'allow';
  reason?: string;
  message?: string;
  userMessage?: string;
}

export type HookHandler = (input: HookInput) => Promise<HookOutput>;

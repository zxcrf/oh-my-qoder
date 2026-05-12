export type ModelTier = 'ultimate' | 'performance' | 'efficient';

export interface AgentDefinition {
  name: string;
  description: string;
  model: ModelTier;
  level: number;
  disallowedTools?: string[];
  systemPrompt: string;
}

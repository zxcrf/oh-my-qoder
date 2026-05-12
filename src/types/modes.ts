export type OrchestrationType = 'ralph' | 'autopilot' | 'ultrawork' | 'team';

export interface ModeState {
  mode: OrchestrationType;
  active: boolean;
  startedAt: string;
  iteration: number;
  maxIterations: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface RalphState extends ModeState {
  mode: 'ralph';
  prd: PrdDocument;
  progress: string[];
}

export interface AutopilotState extends ModeState {
  mode: 'autopilot';
  phase: 0 | 1 | 2 | 3 | 4;
  spec?: string;
  phaseHistory: string[];
}

export interface UltraworkState extends ModeState {
  mode: 'ultrawork';
  tasks: UltraworkTask[];
}

export interface TeamState extends ModeState {
  mode: 'team';
  agents: string[];
  delegations: TeamDelegation[];
}

export interface PrdDocument {
  title: string;
  stories: UserStory[];
}

export interface UserStory {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  passed: boolean;
  reviewerVerified: boolean;
}

export interface UltraworkTask {
  id: string;
  agent: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}

export interface TeamDelegation {
  agent: string;
  task: string;
  status: 'pending' | 'running' | 'done';
}

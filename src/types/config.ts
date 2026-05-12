export interface OmqConfig {
  modes: {
    ralph: { enabled: boolean; maxIterations: number; defaultCritic: string };
    autopilot: { enabled: boolean; maxQaCycles: number };
    ultrawork: { enabled: boolean };
  };
  codeSimplifier: { enabled: boolean; extensions: string[]; maxFiles: number };
  contextGuard: { enabled: boolean; threshold: number };
  projectMemory: { enabled: boolean };
  security: { hardMaxIterations: number };
}

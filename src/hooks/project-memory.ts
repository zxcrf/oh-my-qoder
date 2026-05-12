/**
 * Project Memory Hook (PostToolUse + PreCompact)
 *
 * Learns from the current session and persists reusable patterns.
 * On PreCompact: saves critical context that might be lost.
 * On PostToolUse: tracks file patterns, common operations, project structure.
 */
import { parseStdinJson, writeOutput } from '../lib/stdin.js';
import { getProjectStateDir } from '../lib/paths.js';
import { atomicWriteJson, readJsonSafe } from '../lib/atomic-write.js';
import { loadConfig } from '../lib/config.js';
import { join } from 'path';
import type { HookInput } from '../types/hooks.js';

interface ProjectMemory {
  lastUpdated: string;
  filePatterns: Record<string, number>; // extension -> count of interactions
  commonPaths: string[];
  notes: string[];
  directives: string[];
}

function getMemoryPath(cwd?: string): string {
  return join(getProjectStateDir(cwd), 'project-memory.json');
}

function loadMemory(cwd?: string): ProjectMemory {
  return readJsonSafe<ProjectMemory>(getMemoryPath(cwd), {
    lastUpdated: new Date().toISOString(),
    filePatterns: {},
    commonPaths: [],
    notes: [],
    directives: [],
  });
}

function saveMemory(memory: ProjectMemory, cwd?: string): void {
  memory.lastUpdated = new Date().toISOString();
  atomicWriteJson(getMemoryPath(cwd), memory);
}

async function handlePostTool(input: HookInput) {
  const config = loadConfig(input.directory);
  if (!config.projectMemory.enabled) {
    writeOutput({ continue: true });
    return;
  }

  const toolInput = input.tool_input as Record<string, string> | undefined;
  if (!toolInput) {
    writeOutput({ continue: true });
    return;
  }

  const memory = loadMemory(input.directory);

  // Track file extensions being worked with
  const filePath = toolInput.file_path || toolInput.path || '';
  if (filePath) {
    const ext = filePath.split('.').pop() || 'unknown';
    memory.filePatterns[ext] = (memory.filePatterns[ext] || 0) + 1;

    // Track common paths (top-level directories)
    const parts = filePath.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const topDir = parts.slice(0, 2).join('/');
      if (!memory.commonPaths.includes(topDir)) {
        memory.commonPaths.push(topDir);
        // Keep only top 20
        if (memory.commonPaths.length > 20) {
          memory.commonPaths = memory.commonPaths.slice(-20);
        }
      }
    }
  }

  saveMemory(memory, input.directory);
  writeOutput({ continue: true });
}

async function handlePreCompact(input: HookInput) {
  const config = loadConfig(input.directory);
  if (!config.projectMemory.enabled) {
    writeOutput({ continue: true });
    return;
  }

  const memory = loadMemory(input.directory);

  // On compaction, inject memory context to survive the compression
  if (memory.notes.length > 0 || memory.directives.length > 0) {
    const context = [
      '📝 **Project Memory** (preserved across compaction):',
      '',
      ...memory.directives.map(d => `- 📌 ${d}`),
      ...memory.notes.slice(-5).map(n => `- ${n}`),
      '',
      `Active file types: ${Object.entries(memory.filePatterns).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ext, count]) => `.${ext}(${count})`).join(', ')}`,
    ].join('\n');

    writeOutput({
      continue: true,
      message: context,
    });
    return;
  }

  writeOutput({ continue: true });
}

async function main() {
  const input = await parseStdinJson<HookInput>();

  if (process.env.DISABLE_OMQ === '1') {
    writeOutput({ continue: true });
    return;
  }

  const mode = process.argv[2]; // 'posttool' or 'precompact'

  if (mode === 'precompact') {
    await handlePreCompact(input);
  } else {
    await handlePostTool(input);
  }
}

main().catch(() => {
  writeOutput({ continue: true });
});

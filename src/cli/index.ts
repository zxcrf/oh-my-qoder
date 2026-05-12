import { Command } from 'commander';
import { setupCommand } from './commands/setup.js';
import { statusCommand } from './commands/status.js';
import { doctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('oh-my-qoder')
  .description('Multi-agent orchestration system for Qoder CLI')
  .version('1.0.0');

program.addCommand(setupCommand);
program.addCommand(statusCommand);
program.addCommand(doctorCommand);

program.parse();
